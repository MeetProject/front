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
          return;
        }

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
              // 연결에 성공했던 클라이언트가 닫힌 경우에만 끊김으로 표시 (최초 연결 실패와 구분)
              isDisconnected: connectedClient !== null,
            });

            reject(new Error('WebSocket connection closed'));
          },
          // 신원이 소켓에 묶인 설계라 자동 재연결로는 구독·신원이 복구되지 않음 → 명시적으로 끔.
          reconnectDelay: 0,
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
      const data = JSON.parse(message.body) as T;
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
    publish,
    request,
    subscribe,
    unsubscribeAll,
  };
};
