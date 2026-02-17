'use client';

import { Consumer, ConsumerOptions, Producer, Transport } from 'mediasoup-client/types';
import { useCallback, useRef } from 'react';

import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { TrackType } from '@/types/deviceType';
import { DtlsReponseType } from '@/types/session';
import { AppData, Direction } from '@/types/webRtc';

export const useMediasoup = (request: <T>(destination: string, payload: any) => Promise<T>) => {
  const sendTransport = useRef<Transport | null>(null);
  const recvTransport = useRef<Transport | null>(null);

  const producers = useRef<Map<TrackType, Producer>>(new Map());
  const consumers = useRef<Map<string, Set<Consumer>>>(new Map());

  const consumeTrack = useCallback(
    async (producerId: string) => {
      const { device } = useWebrtcStore.getState();
      const { removeTrack } = useParticipantStore.getState();
      if (!recvTransport.current || !device) {
        return null;
      }

      try {
        const consumeParams = await request<ConsumerOptions<AppData>>('/app/signal/consumerParams', {
          producerId,
          rtpCapabilities: device.rtpCapabilities,
          transportId: recvTransport.current.id,
        });

        const consumer = await recvTransport.current.consume(consumeParams);
        await request<void>('/app/signal/resume', {
          consumerId: consumer.id,
        });

        const { appData, track } = consumer;
        const { kind, userId } = appData as AppData;
        if (!consumers.current.has(userId)) {
          consumers.current.set(userId, new Set());
        }
        consumers.current.get(userId)!.add(consumer);
        consumer.on('@close', () => {
          const userSet = consumers.current.get(userId);
          if (!userSet) {
            return;
          }

          userSet.delete(consumer);
          if (userSet.size === 0) {
            consumers.current.delete(userId);
          }

          removeTrack(userId, kind, track);
        });

        return {
          appData,
          track,
        };
      } catch {
        return null;
      }
    },
    [request],
  );

  const createTransport = useCallback(
    async (direction: Direction) => {
      const { device } = useWebrtcStore.getState();
      if (!device) {
        return;
      }

      const { options } = await request<DtlsReponseType>('/app/signal/dtls', {
        direction,
      });

      const transport =
        direction === 'send' ? device.createSendTransport(options) : device.createRecvTransport(options);

      transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          await request('/app/signal/dtls/connect', {
            dtlsParameters,
            transportId: transport.id,
          });
          callback();
        } catch (e) {
          errback(e as Error);
        }
      });

      if (direction === 'recv') {
        recvTransport.current = transport;
        return;
      }

      transport.on('produce', async ({ appData, rtpParameters }, callback, errback) => {
        try {
          const producerId = await request<string>('/app/signal/rtls', {
            appData,
            rtpParameters,
            transportId: transport.id,
          });
          callback({ id: producerId });
        } catch (e) {
          errback(e as Error);
        }
      });
      sendTransport.current = transport;
    },
    [request],
  );

  const produceTrack = useCallback(async (track: MediaStreamTrack, trackType: TrackType) => {
    const { userId } = useUserInfoStore.getState();
    if (!sendTransport.current || !userId) {
      return '';
    }
    const producer = await sendTransport.current.produce({
      appData: { trackType, userId },
      track,
    });

    producers.current.set(trackType, producer);

    return producer.id;
  }, []);

  const removeProducer = useCallback((trackType: TrackType) => {
    const oldProducer = producers.current.get(trackType);
    if (!oldProducer) {
      return;
    }

    oldProducer.close();
    producers.current.delete(trackType);
    return oldProducer.id;
  }, []);

  const removeConsumer = useCallback((userId: string) => {
    const consumer = consumers.current.get(userId);
    if (!consumer) {
      return;
    }

    consumer.forEach((c) => c.close());
    consumers.current.delete(userId);
  }, []);

  const replaceProducerTrack = useCallback(async (trackType: TrackType, newTrack: MediaStreamTrack | null) => {
    const producer = producers.current.get(trackType);
    if (!producer) {
      return;
    }

    try {
      producer.track?.stop();
      await producer.replaceTrack({ track: newTrack });
    } catch {}
  }, []);

  const disconnectTransport = useCallback(() => {
    sendTransport.current?.close();
    recvTransport.current?.close();
    sendTransport.current = null;
    recvTransport.current = null;
  }, []);

  const disconnectMediasoup = useCallback(() => {
    useWebrtcStore.setState({ device: null });
  }, []);

  return {
    consumeTrack,
    createTransport,
    disconnectMediasoup,
    disconnectTransport,
    produceTrack,
    removeConsumer,
    removeProducer,
    replaceProducerTrack,
  };
};
