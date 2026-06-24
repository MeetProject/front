'use client';

import { Client, IFrame, IMessage, Message, StompConfig } from '@stomp/stompjs';
import { useCallback } from 'react';
import SockJS from 'sockjs-client';

import { useSignalStore } from '@/store/useSignalStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

const STOMP_TIMEOUT = 10000;

export const useSignaling = (url: string) => {
  const handleReply = useCallback((message: IMessage) => {
    try {
      const { pendingRequest } = useSignalStore.getState();
      const { correlationId, ...data } = JSON.parse(message.body);

      const request = pendingRequest.get(correlationId);

      if (!request) {
        return;
      }

      clearTimeout(request.timeoutId);
      pendingRequest.delete(correlationId);

      request.resolve(data);
    } catch {}
  }, []);

  const connect = useCallback(
    async (config?: StompConfig): Promise<Client> =>
      new Promise((resolve, reject) => {
        const { client, subscription } = useSignalStore.getState();
        if (client?.active) {
          resolve(client);
          return;
        }

        const { userId } = useUserInfoStore.getState();

        if (!userId) {
          reject('userId');
          return;
        }

        const newClient = new Client({
          ...config,
          brokerURL: undefined,
          onConnect: (frame: IFrame) => {
            useSignalStore.setState({ client: newClient, status: 'connected' });

            const repliesSub = newClient.subscribe('/user/queue/replies', handleReply);
            subscription.set('replies', repliesSub);

            config?.onConnect?.(frame);
            resolve(newClient);
          },
          onStompError: (frame) => {
            config?.onStompError?.(frame);
            reject(new Error('STOMP protocol error'));
          },
          onWebSocketClose: (evt: CloseEvent) => {
            config?.onWebSocketClose?.(evt);

            if (evt?.code === 1000) {
              newClient.deactivate();
              useSignalStore.setState({ status: 'closed' });
              resolve(newClient);
              return;
            }

            useSignalStore.setState({ status: 'reconnecting' });
            reject(new Error('WebSocket connection closed'));
          },
          reconnectDelay: 3000,
          webSocketFactory: () =>
            new SockJS(`${url}?userId=${userId}`, null, {
              timeout: 5000,
              transports: ['websocket'],
            }),
        });
        newClient.activate();
      }),
    [url, handleReply],
  );

  const publish = useCallback(<T>(destination: string, payload?: T) => {
    const { client } = useSignalStore.getState();
    if (!client) {
      return;
    }

    client.publish({
      body: JSON.stringify(payload),
      destination,
      headers: { 'content-type': 'application/json' },
    });
  }, []);

  const subscribe = useCallback(<T>(destination: string, callback: (response: T) => Promise<void> | void) => {
    const { client, subscription } = useSignalStore.getState();
    if (!client) {
      return;
    }

    const sub = client.subscribe(destination, async (message: Message) => {
      try {
        const data = JSON.parse(message.body) as T;
        await callback(data);
      } catch {}
    });

    subscription.set(destination, sub);
  }, []);

  const unsubscribe = useCallback((destination: string) => {
    const { subscription } = useSignalStore.getState();
    if (!subscription.has(destination)) {
      return;
    }

    subscription.get(destination)?.unsubscribe();
    subscription.delete(destination);
  }, []);

  const unsubscribeAll = useCallback(() => {
    const { subscription } = useSignalStore.getState();
    subscription.keys().forEach((path) => {
      if (path === 'replies') {
        return;
      }

      subscription.get(path)?.unsubscribe();
      subscription.delete(path);
    });
  }, []);

  const disconnect = useCallback(() => {
    const { client, pendingRequest, subscription } = useSignalStore.getState();
    if (!client) {
      return;
    }

    pendingRequest.forEach((request) => {
      clearTimeout(request.timeoutId);
      request.reject(new Error('STOMP disconnected'));
    });
    pendingRequest.clear();

    subscription.values().forEach((sub) => sub.unsubscribe());
    subscription.clear();

    client.deactivate();
    useSignalStore.setState({ client: null, status: 'closed' });
  }, []);

  const request = useCallback(
    <T>(destination: string, payload?: any): Promise<T> =>
      new Promise((resolve, reject) => {
        const { client, pendingRequest } = useSignalStore.getState();
        if (!client || !client.active) {
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

        client.publish({
          body: JSON.stringify({ ...payload, correlationId }),
          destination: destination,
          headers: { 'content-type': 'application/json' },
        });
      }),
    [],
  );

  return {
    connect,
    disconnect,
    publish,
    request,
    subscribe,
    unsubscribe,
    unsubscribeAll,
  };
};
