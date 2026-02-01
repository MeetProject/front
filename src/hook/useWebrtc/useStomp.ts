'use client';

import { Client, IFrame, Message, StompConfig, StompSubscription } from '@stomp/stompjs';
import { useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';

export const useStomp = (url: string) => {
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

  const disconnect = () => {
    if (!client.current) {
      return;
    }

    subscription.current.forEach((sub) => sub.unsubscribe());
    client.current.deactivate();
    client.current = null;
  };

  return {
    client: client.current,
    connect,
    disconnect,
    publish,
    subscribe,
    unsubscribe,
  };
};
