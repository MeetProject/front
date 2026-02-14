'use client';

import { Client, IFrame, IMessage, Message, StompConfig, StompSubscription } from '@stomp/stompjs';
import { useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';

import { useUserInfoStore } from '@/store/useUserInfoStore';

const STOMP_TIMEOUT = 10000;

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeoutId: NodeJS.Timeout;
}

export const useSignaling = (url: string) => {
  const client = useRef<Client>(null);
  const subscription = useRef<Map<string, StompSubscription>>(new Map());
  const pendingRequests = useRef<Map<string, PendingRequest>>(new Map());

  const handleReply = useCallback((message: IMessage) => {
    const { correlationId, ...data } = JSON.parse(message.body);

    const request = pendingRequests.current.get(correlationId);

    if (!request) {
      return;
    }

    clearTimeout(request.timeoutId);
    pendingRequests.current.delete(correlationId);

    request.resolve(data);
  }, []);

  const connect = useCallback(
    async (config?: StompConfig): Promise<Client> =>
      new Promise((resolve, reject) => {
        if (client.current?.active) {
          resolve(client.current);
        }

        const { userId } = useUserInfoStore.getState();

        if (!userId) {
          reject('userId');
        }

        const newClient = new Client({
          ...config,
          brokerURL: undefined,
          onConnect: (frame: IFrame) => {
            client.current = newClient;

            const repliesSub = newClient.subscribe('/user/queue/replies', handleReply);
            subscription.current.set('replies', repliesSub);

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
    if (!client.current) {
      return;
    }

    client.current.publish({
      body: JSON.stringify(payload),
      destination,
      headers: { 'content-type': 'application/json' },
    });
  }, []);

  const subscribe = useCallback(<T>(destination: string, callback: (response: T) => Promise<void> | void) => {
    if (!client.current) {
      return;
    }

    const sub = client.current.subscribe(destination, async (message: Message) => {
      const data = JSON.parse(message.body) as T;
      await callback(data);
    });

    subscription.current.set(destination, sub);
  }, []);

  const unsubscribe = useCallback((destination: string) => {
    if (!subscription.current.has(destination)) {
      return;
    }

    subscription.current.get(destination)?.unsubscribe();
    subscription.current.delete(destination);
  }, []);

  const unsubscribeAll = useCallback(() => {
    subscription.current.values().forEach((sub) => sub.unsubscribe());
    subscription.current.clear();
  }, []);

  const disconnect = useCallback(() => {
    if (!client.current) {
      return;
    }

    unsubscribeAll();
    client.current.deactivate();
    client.current = null;
  }, [unsubscribeAll]);

  const request = useCallback(
    <T>(destination: string, payload?: any): Promise<T> =>
      new Promise((resolve, reject) => {
        if (!client.current || !client.current.active) {
          return reject(new Error('STOMP client is not connected'));
        }

        const correlationId = crypto.randomUUID();

        const timeoutId = setTimeout(() => {
          pendingRequests.current.delete(correlationId);
          reject(new Error(`STOMP Timeout: ${destination}`));
        }, STOMP_TIMEOUT);

        pendingRequests.current.set(correlationId, {
          reject,
          resolve,
          timeoutId,
        });

        client.current.publish({
          body: JSON.stringify({ ...payload, correlationId }),
          destination: destination,
          headers: { 'content-type': 'application/json' },
        });
      }),
    [],
  );

  return {
    client: client.current,
    connect,
    disconnect,
    publish,
    request,
    subscribe,
    unsubscribe,
    unsubscribeAll,
  };
};
