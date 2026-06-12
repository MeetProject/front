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
    async (config?: StompConfig): Promise<Client> => {
      const { client } = useSignalStore.getState();
      if (client?.connected) {
        return client;
      }

      // 동시에 connect가 불려도 클라이언트가 하나만 생성되도록 진행 중인 연결을 공유
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
            // ERROR 프레임 이후 서버가 연결을 닫으므로 더 못 쓰는 클라이언트를 정리 (스토어 저장 전이라 여기서만 접근 가능)
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
    // 미연결 상태에서 publish하면 stompjs가 throw하므로 connected까지 확인
    if (!client?.connected) {
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
    if (!client?.connected) {
      return;
    }

    // 같은 destination을 다시 구독하면 이전 구독이 맵에서 유실돼 해제 불가능해지므로 먼저 정리
    subscription.get(destination)?.unsubscribe();

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
          // connected 체크와 publish 사이에 끊긴 경우 타임아웃까지 기다리지 않고 즉시 정리
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
