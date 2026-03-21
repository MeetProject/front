'use client';

import { Consumer, Producer, Transport } from 'mediasoup-client/types';
import { useCallback, useRef } from 'react';

import { useDeviceStore } from '@/store/useDeviceStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { DeviceKindType, TrackType } from '@/types/deviceType';
import { ConsumerParamsResponseType, DtlsReponseType } from '@/types/session';
import { AppData, Direction } from '@/types/webRtc';

export const useMediasoup = (
  publish: <T>(destination: string, payload?: T | undefined) => void,
  request: <T>(destination: string, payload: any) => Promise<T>,
) => {
  const sendTransport = useRef<Transport | null>(null);
  const recvTransport = useRef<Transport | null>(null);

  const producers = useRef<Map<DeviceKindType, Producer>>(new Map());
  const screenProducers = useRef<Map<string, Producer>>(new Map());

  const consumers = useRef<Map<string, Map<TrackType, Consumer>>>(new Map());
  const screenConsumers = useRef<Map<string, Consumer>>(new Map());
  const currentScreenSender = useRef<string | null>(null);

  const resumedConsumer = useRef<Map<string, boolean>>(new Map());

  const consumeTrack = useCallback(
    async (targetId: string, producerId: string) => {
      const { userId: id } = useUserInfoStore.getState();
      const { device } = useWebrtcStore.getState();
      const { removeTrack } = useParticipantStore.getState();
      if (!recvTransport.current || !device || targetId === id) {
        return null;
      }

      try {
        const { consumerParams } = await request<ConsumerParamsResponseType>('/app/signal/consumerParams', {
          producerId,
          rtpCapabilities: device.rtpCapabilities,
          targetId,
          transportId: recvTransport.current.id,
        });

        const consumer = await recvTransport.current.consume(consumerParams);

        const { appData, track } = consumer;
        const { trackType, userId } = appData as AppData;

        if (trackType === 'screen') {
          currentScreenSender.current = userId;
          screenConsumers.current.set(consumer.id, consumer);
          await publish('/app/consumer/resume', {
            consumerId: consumer.id,
          });
        } else {
          if (!consumers.current.has(userId)) {
            consumers.current.set(userId, new Map());
          }
          consumers.current.get(userId)!.set(trackType, consumer);
        }

        consumer.on('@close', () => {
          const userSet = consumers.current.get(userId);
          if (!userSet) {
            return;
          }

          userSet.delete(trackType);
          if (userSet.size === 0) {
            consumers.current.delete(userId);
          }

          removeTrack(userId, trackType);
          resumedConsumer.current.delete(consumer.id);
        });

        return {
          appData,
          track,
        };
      } catch {
        return null;
      }
    },
    [request, publish],
  );

  const resumeConsumer = useCallback(
    async (userId: string, trackType: TrackType) => {
      const { isExistRoom } = useWebrtcStore.getState();

      if (isExistRoom) {
        return;
      }

      const consumerId = consumers.current.get(userId)?.get(trackType)?.id;

      if (!consumerId || resumedConsumer.current.get(consumerId)) {
        return;
      }

      await publish('/app/consumer/resume', {
        consumerId,
      });
      resumedConsumer.current.set(consumerId, true);
    },
    [publish],
  );

  const pauseConsumer = useCallback(
    async (userId: string, trackType: TrackType) => {
      const { isExistRoom } = useWebrtcStore.getState();

      if (isExistRoom) {
        return;
      }

      const consumerId = consumers.current.get(userId)?.get(trackType)?.id;

      if (!consumerId || !resumedConsumer.current.get(consumerId)) {
        return;
      }

      await publish('/app/consumer/pause', {
        consumerId,
      });

      resumedConsumer.current.delete(consumerId);
    },
    [publish],
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
            direction,
            dtlsParameters,
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
          const { producerId } = await request<Record<'producerId', string>>('/app/signal/rtls', {
            appData,
            kind: appData.trackType === 'audio' || appData.trackType === 'screenAudio' ? 'audio' : 'video',
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

    if (trackType === 'screen') {
      screenProducers.current.set(producer.id, producer);
      return producer.id;
    }

    producers.current.set(trackType, producer);
    return producer.id;
  }, []);

  const removeProducer = useCallback((trackType: TrackType) => {
    if (trackType === 'screen') {
      const producerIds = Array.from(screenProducers.current.keys());
      screenProducers.current.forEach((p) => p.close());
      screenProducers.current.clear();
      return producerIds;
    }

    const oldProducer = producers.current.get(trackType);
    if (!oldProducer) {
      return;
    }

    oldProducer.close();

    producers.current.delete(trackType);

    return [oldProducer.id];
  }, []);

  const removeScreenConsumer = useCallback(() => {
    screenConsumers.current.forEach((c) => c.close());
    screenConsumers.current.clear();
    currentScreenSender.current = null;
  }, []);

  const removeConsumer = useCallback(
    (userId: string, trackType?: TrackType) => {
      if (!trackType) {
        consumers.current.get(userId)?.forEach((c) => c.close());
        consumers.current.delete(userId);

        if (currentScreenSender.current === userId) {
          removeScreenConsumer();
        }
        return;
      }

      if (trackType === 'screen') {
        removeScreenConsumer();
        return;
      }

      const userConsumer = consumers.current.get(userId);
      if (!userConsumer) {
        return;
      }

      const consumer = userConsumer.get(trackType);
      if (!consumer) {
        return;
      }

      consumer.close();
      userConsumer.delete(trackType);

      if (userConsumer.size === 0) {
        consumers.current.delete(userId);
      }
    },
    [removeScreenConsumer],
  );

  const replaceProducerTrack = useCallback(async (trackType: DeviceKindType, newTrack: MediaStreamTrack | null) => {
    const producer = producers.current.get(trackType);
    if (!producer) {
      return;
    }

    try {
      producer.track?.stop();
      await producer.replaceTrack({ track: newTrack });
    } catch {}
  }, []);

  const toggleProducerTrack = useCallback(
    async (trackType: DeviceKindType, value?: boolean) => {
      const producer = producers.current.get(trackType);
      if (!producer) {
        return;
      }

      const { deviceEnable } = useDeviceStore.getState();

      if (value !== undefined) {
        const endPoint = value ? '/app/signal/producer/resume' : '/app/signal/producer/pause';
        await request(endPoint, { producerId: producer.id });
        return;
      }

      if (deviceEnable[trackType]) {
        await request('/app/signal/producer/pause', producer.id);
        return;
      }

      await request('/app/signal/producer/resume', producer.id);
    },
    [request],
  );

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
    pauseConsumer,
    produceTrack,
    removeConsumer,
    removeProducer,
    replaceProducerTrack,
    resumeConsumer,
    toggleProducerTrack,
  };
};
