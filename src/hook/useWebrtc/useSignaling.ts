'use client';

import { Client, IFrame, Message, StompConfig, StompSubscription } from '@stomp/stompjs';
import { useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';

const STOMP_TIMEOUT = 10000;

export const useSignaling = (url: string) => {
  const client = useRef<Client>(null);
  const subscription = useRef<Map<string, StompSubscription>>(new Map());

  const connect = async (config?: StompConfig): Promise<Client> =>
    new Promise((resolve, reject) => {
      if (client.current?.active) {
        resolve(client.current);
      }

      const newClient = new Client({
        ...config,
        brokerURL: undefined,
        onConnect: (frame: IFrame) => {
          client.current = newClient;
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
        webSocketFactory: () => new SockJS(url),
      });
      newClient.activate();
    });

  const publish = <T>(destination: string, payload?: T) => {
    if (!client.current) {
      return;
    }

    client.current.publish({
      body: JSON.stringify(payload),
      destination,
      headers: { 'content-type': 'application/json' },
    });
  };

  const subscribe = <T>(destination: string, callback: (response: T) => Promise<void> | void) => {
    if (!client.current) {
      return;
    }

    const sub = client.current.subscribe(destination, async (message: Message) => {
      const data = JSON.parse(message.body) as T;
      await callback(data);
    });

    subscription.current.set(destination, sub);
  };

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
        if (!client.current?.active) {
          return reject(new Error('STOMP client is not connected'));
        }

        const correlationId = crypto.randomUUID();
        const replyDestination = '/user/queue/replies';

        const timeoutId = setTimeout(() => {
          sub.unsubscribe();
          reject(new Error(`STOMP Timeout: ${destination}`));
        }, STOMP_TIMEOUT);

        const sub = client.current.subscribe(replyDestination, (message) => {
          try {
            const body = JSON.parse(message.body);
            if (body.correlationId === correlationId) {
              clearTimeout(timeoutId);
              sub.unsubscribe();

              if (body.status === 'ERROR') {
                reject(new Error(body.message || 'Unknown Server Error'));
              } else {
                resolve(body.data as T);
              }
            }
          } catch {}
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
