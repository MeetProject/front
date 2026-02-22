'use client';

import { Client, IFrame, IMessage, Message, StompConfig } from '@stomp/stompjs';
import { useCallback } from 'react';
import SockJS from 'sockjs-client';

import { useSignalStore } from '@/store/useSignalStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

const STOMP_TIMEOUT = 10000;

export const useSignaling = (url: string) => {
  const handleReply = useCallback((message: IMessage) => {
    const { pendingRequest } = useSignalStore.getState();
    const { correlationId, ...data } = JSON.parse(message.body);

    const request = pendingRequest.get(correlationId);

    if (!request) {
      return;
    }

    clearTimeout(request.timeoutId);
    pendingRequest.delete(correlationId);

    request.resolve(data);
  }, []);

  const connect = useCallback(
    async (config?: StompConfig): Promise<Client> =>
      new Promise((resolve, reject) => {
        const { client, subscription } = useSignalStore.getState();
        if (client?.active) {
          resolve(client);
        }

        const { userId } = useUserInfoStore.getState();

        if (!userId) {
          reject('userId');
        }

        const newClient = new Client({
          ...config,
          brokerURL: undefined,
          onConnect: (frame: IFrame) => {
            useSignalStore.setState({ client: newClient });

            const repliesSub = newClient.subscribe('/user/queue/replies', handleReply);
            subscription.set('replies', repliesSub);

            config?.onConnect?.(frame);
            resolve(newClient);
          },
          onStompError: (frame) => {
            config?.onStompError?.(frame);
            reject(new Error('STOMP protocol error'));
          },
          onWebSocketClose: <T>(evt: T) => {
            config?.onWebSocketClose?.(evt);
            reject(new Error('WebSocket connection closed'));
          },
          webSocketFactory: () => new SockJS(`${url}?userId=${userId}`),
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
      const data = JSON.parse(message.body) as T;
      await callback(data);
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
    subscription.values().forEach((sub) => sub.unsubscribe());
    subscription.clear();
  }, []);

  const disconnect = useCallback(() => {
    const { client } = useSignalStore.getState();
    if (!client) {
      return;
    }

    unsubscribeAll();
    client.deactivate();
    useSignalStore.setState({ client: null });
  }, [unsubscribeAll]);

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
