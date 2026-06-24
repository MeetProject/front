'use client';

import { Device } from 'mediasoup-client';
import { Consumer, Producer, RtpCapabilities, Transport } from 'mediasoup-client/types';
import { useCallback, useRef } from 'react';

import { useAudioStore } from '@/store/useAudioStore';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { DeviceKindType, TrackType } from '@/types/deviceType';
import { AppData, ConsumerParamsResponseType, Direction, DtlsReponseType } from '@/types/session';

const RECV_READY_TIMEOUT = 10000;

interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
}

const createDeferred = (): Deferred => {
  const handlers: { resolve: () => void } = { resolve: () => {} };
  const promise = new Promise<void>((resolve) => {
    handlers.resolve = resolve;
  });
  return { promise, resolve: () => handlers.resolve() };
};

export const useMediasoup = (
  publish: <T>(destination: string, payload?: T | undefined) => void,
  request: <T>(destination: string, payload: any) => Promise<T>,
) => {
  const deviceRef = useRef<Device | null>(null);
  const sendTransport = useRef<Transport | null>(null);
  const recvTransport = useRef<Transport | null>(null);

  const producers = useRef<Map<DeviceKindType, Producer>>(new Map());
  const screenProducers = useRef<Map<string, Producer>>(new Map());

  const consumers = useRef<Map<string, Map<TrackType, Consumer>>>(new Map());
  const screenConsumers = useRef<Map<string, Consumer>>(new Map());

  const resumedConsumer = useRef<Set<string>>(new Set());

  const recvReadyRef = useRef<Deferred | null>(null);

  const ensureRecvReady = useCallback(() => {
    if (!recvReadyRef.current) {
      recvReadyRef.current = createDeferred();
    }
    return recvReadyRef.current;
  }, []);

  const initDevice = useCallback(async (capabilities: RtpCapabilities) => {
    if (deviceRef.current) {
      return deviceRef.current;
    }
    try {
      const device = new Device();
      await device.load({ routerRtpCapabilities: capabilities });
      deviceRef.current = device;
      return device;
    } catch {
      return null;
    }
  }, []);

  const clearDevice = useCallback(() => {
    deviceRef.current = null;
  }, []);

  const handleConsumerClose = useCallback((consumer: Consumer, trackType: TrackType, userId: string) => {
    const { removeTrack } = useParticipantStore.getState();
    const { removeAudioTrack } = useAudioStore.getState();

    if (trackType === 'screen') {
      screenConsumers.current.delete(consumer.id);
      return;
    }

    const userSet = consumers.current.get(userId);
    if (!userSet) {
      return;
    }

    userSet.delete(trackType);
    if (userSet.size === 0) {
      consumers.current.delete(userId);
    }

    if (trackType === 'audio') {
      removeAudioTrack(userId);
    }
    if (trackType !== 'audio') {
      removeTrack(userId, trackType);
    }

    resumedConsumer.current.delete(consumer.id);
  }, []);

  const consumeTrack = useCallback(
    async (targetId: string, producerId: string) => {
      const { userId: id } = useUserInfoStore.getState();

      if (targetId === id) {
        return null;
      }

      await Promise.race([
        ensureRecvReady().promise,
        new Promise<void>((resolve) => setTimeout(resolve, RECV_READY_TIMEOUT)),
      ]);

      const device = deviceRef.current;

      if (!recvTransport.current || !device) {
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

        if (trackType !== 'video') {
          await publish('/app/consumer/resume', {
            consumerId: consumer.id,
          });
          resumedConsumer.current.add(consumer.id);
        }

        if (trackType === 'screen') {
          screenConsumers.current.set(consumer.id, consumer);
        }

        if (trackType !== 'screen') {
          const userConsumers = consumers.current.get(userId) ?? new Map<TrackType, Consumer>();
          userConsumers.set(trackType, consumer);
          consumers.current.set(userId, userConsumers);
        }

        consumer.on('@close', () => handleConsumerClose(consumer, trackType, userId));

        return {
          appData,
          track,
        };
      } catch {
        return null;
      }
    },
    [request, publish, handleConsumerClose, ensureRecvReady],
  );

  const resumeConsumer = useCallback(
    async (userId: string, trackType: TrackType) => {
      const { isExitingRoom } = useWebrtcStore.getState();

      if (isExitingRoom) {
        return;
      }

      const consumerId = consumers.current.get(userId)?.get(trackType)?.id;

      if (!consumerId || resumedConsumer.current.has(consumerId)) {
        return;
      }

      await publish('/app/consumer/resume', {
        consumerId,
      });
      resumedConsumer.current.add(consumerId);
    },
    [publish],
  );

  const pauseConsumer = useCallback(
    async (userId: string, trackType: TrackType) => {
      const { isExitingRoom } = useWebrtcStore.getState();

      if (isExitingRoom) {
        return;
      }

      const consumerId = consumers.current.get(userId)?.get(trackType)?.id;

      if (!consumerId || !resumedConsumer.current.has(consumerId)) {
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
      const device = deviceRef.current;
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
        ensureRecvReady().resolve();
        return;
      }

      transport.on('produce', async ({ appData, kind, rtpParameters }, callback, errback) => {
        try {
          const { producerId } = await request<Record<'producerId', string>>('/app/signal/rtls', {
            appData,
            kind,
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
    [request, ensureRecvReady],
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
  }, []);

  const removeConsumer = useCallback(
    (userId: string, trackType?: TrackType) => {
      if (!trackType) {
        consumers.current.get(userId)?.forEach((c) => c.close());
        consumers.current.delete(userId);

        const ownsScreen = [...screenConsumers.current.values()].some((c) => (c.appData as AppData).userId === userId);
        if (ownsScreen) {
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
      const shouldResume = value !== undefined ? value : !deviceEnable[trackType];
      const endPoint = shouldResume ? '/app/signal/producer/resume' : '/app/signal/producer/pause';

      await request(endPoint, { producerId: producer.id });
    },
    [request],
  );

  const disconnectTransport = useCallback(() => {
    sendTransport.current?.close();
    recvTransport.current?.close();
    sendTransport.current = null;
    recvTransport.current = null;

    consumers.current.clear();
    screenConsumers.current.clear();
    producers.current.clear();
    screenProducers.current.clear();
    resumedConsumer.current.clear();
    recvReadyRef.current = null;
  }, []);

  return {
    clearDevice,
    consumeTrack,
    createTransport,
    disconnectTransport,
    initDevice,
    pauseConsumer,
    produceTrack,
    removeConsumer,
    removeProducer,
    replaceProducerTrack,
    resumeConsumer,
    toggleProducerTrack,
  };
};
