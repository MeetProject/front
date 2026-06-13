'use client';

import { Client, IFrame, IMessage, Message, StompConfig } from '@stomp/stompjs';
import { useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';

import { useSignalStore } from '@/store/useSignalStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

const STOMP_TIMEOUT = 10000;

export const useSignaling = (url: string) => {
  const connectPromise = useRef<Promise<Client> | null>(null);

  const handleReply = useCallback((message: IMessage) => {
    const { pendingRequest } = useSignalStore.getState();

    let parsed;
    try {
      parsed = JSON.parse(message.body);
    } catch {
      return;
    }
    const { correlationId, ...data } = parsed;

    const request = pendingRequest.get(correlationId);

    if (!request) {
      return;
    }

    clearTimeout(request.timeoutId);
    pendingRequest.delete(correlationId);

    if (data.error) {
      request.reject(new Error(typeof data.error === 'string' ? data.error : 'STOMP request failed'));
      return;
    }

    request.resolve(data);
  }, []);

  const connect = useCallback(
    async (config?: StompConfig): Promise<Client> => {
      const { client } = useSignalStore.getState();
      if (client?.connected) {
        return client;
      }

      if (connectPromise.current) {
        return connectPromise.current;
      }

      const promise = new Promise<Client>((resolve, reject) => {
        const { subscription } = useSignalStore.getState();
        const { userId } = useUserInfoStore.getState();

        if (!userId) {
          reject(new Error('userId가 없습니다'));
          return;
        }

        const newClient = new Client({
          ...config,
          brokerURL: undefined,
          onConnect: (frame: IFrame) => {
            useSignalStore.setState({ client: newClient, isDisconnected: false });

            const repliesSub = newClient.subscribe('/user/queue/replies', handleReply);
            subscription.set('replies', repliesSub);

            config?.onConnect?.(frame);
            resolve(newClient);
          },
          onStompError: (frame) => {
            config?.onStompError?.(frame);
            newClient.deactivate().catch(() => {});
            reject(new Error('STOMP protocol error'));
          },
          onWebSocketClose: (evt: CloseEvent) => {
            config?.onWebSocketClose?.(evt);

            const {
              client: connectedClient,
              pendingRequest,
              subscription: currentSubscription,
            } = useSignalStore.getState();
            pendingRequest.forEach(({ reject: rejectRequest, timeoutId }) => {
              clearTimeout(timeoutId);
              rejectRequest(new Error('WebSocket connection closed'));
            });
            pendingRequest.clear();
            currentSubscription.clear();

            newClient.deactivate().catch(() => {});
            useSignalStore.setState({
              client: null,
              isDisconnected: connectedClient !== null,
            });

            useUserInfoStore.setState({ userColor: null, userId: null, userName: null });

            reject(new Error('WebSocket connection closed'));
          },
          reconnectDelay: 0,
          webSocketFactory: () =>
            new SockJS(`${url}?userId=${userId}`, null, {
              timeout: 5000,
              transports: ['websocket'],
            }),
        });
        newClient.activate();
      });

      connectPromise.current = promise;
      try {
        return await promise;
      } finally {
        connectPromise.current = null;
      }
    },
    [url, handleReply],
  );

  const publish = useCallback(<T>(destination: string, payload?: T) => {
    const { client } = useSignalStore.getState();
    if (!client?.connected) {
      return false;
    }

    try {
      client.publish({
        body: JSON.stringify(payload),
        destination,
        headers: { 'content-type': 'application/json' },
      });
    } catch {
      return false;
    }
    return true;
  }, []);

  const subscribe = useCallback(<T>(destination: string, callback: (response: T) => Promise<void> | void) => {
    const { client, subscription } = useSignalStore.getState();
    if (!client?.connected) {
      return;
    }

    subscription.get(destination)?.unsubscribe();

    const sub = client.subscribe(destination, async (message: Message) => {
      let data: T;
      try {
        data = JSON.parse(message.body) as T;
      } catch {
        return;
      }
      await callback(data);
    });

    subscription.set(destination, sub);
  }, []);

  const unsubscribeAll = useCallback(() => {
    const { subscription } = useSignalStore.getState();
    [...subscription.keys()].forEach((path) => {
      if (path === 'replies') {
        return;
      }

      subscription.get(path)?.unsubscribe();
      subscription.delete(path);
    });
  }, []);

  const request = useCallback(
    <T>(destination: string, payload?: any): Promise<T> =>
      new Promise((resolve, reject) => {
        const { client, pendingRequest } = useSignalStore.getState();
        if (!client?.connected) {
          return reject(new Error('STOMP client is not connected'));
        }

        const correlationId = crypto.randomUUID();

        const timeoutId = setTimeout(() => {
          pendingRequest.delete(correlationId);
          reject(new Error(`STOMP Timeout: ${destination}`));
        }, STOMP_TIMEOUT);

        pendingRequest.set(correlationId, {
          reject,
          resolve,
          timeoutId,
        });

        try {
          client.publish({
            body: JSON.stringify({ ...payload, correlationId }),
            destination: destination,
            headers: { 'content-type': 'application/json' },
          });
        } catch (e) {
          clearTimeout(timeoutId);
          pendingRequest.delete(correlationId);
          reject(e);
        }
      }),
    [],
  );

  return {
    connect,
    publish,
    request,
    subscribe,
    unsubscribeAll,
  };
};
