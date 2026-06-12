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
import { AppData, ConsumerParamsResponseType, Direction, DtlsResponseType } from '@/types/session';

const isScreenTrack = (trackType: TrackType) => trackType === 'screen' || trackType === 'screenAudio';

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
  const currentScreenSender = useRef<string | null>(null);

  const resumedConsumer = useRef<Map<string, boolean>>(new Map());
  const consumedProducers = useRef<Set<string>>(new Set());
  const pendingProduce = useRef<Map<DeviceKindType, Promise<string>>>(new Map());

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

    if (isScreenTrack(trackType)) {
      screenConsumers.current.delete(consumer.id);
      if (currentScreenSender.current === userId && screenConsumers.current.size === 0) {
        currentScreenSender.current = null;
      }
      resumedConsumer.current.delete(consumer.id);
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

  const removeScreenConsumer = useCallback((senderId?: string) => {
    screenConsumers.current.forEach((consumer, consumerId) => {
      const { userId } = consumer.appData as AppData;
      if (senderId && userId !== senderId) {
        return;
      }
      consumer.close();
      screenConsumers.current.delete(consumerId);
    });

    if (!senderId || currentScreenSender.current === senderId) {
      currentScreenSender.current = null;
    }
  }, []);

  const consumeTrack = useCallback(
    async (targetId: string, producerId: string) => {
      const { userId: id } = useUserInfoStore.getState();
      const device = deviceRef.current;

      if (!recvTransport.current || !device || targetId === id || consumedProducers.current.has(producerId)) {
        return null;
      }
      consumedProducers.current.add(producerId);

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
          publish('/app/consumer/resume', {
            consumerId: consumer.id,
          });
          resumedConsumer.current.set(consumer.id, true);
        }

        if (isScreenTrack(trackType)) {
          if (currentScreenSender.current && currentScreenSender.current !== userId) {
            removeScreenConsumer(currentScreenSender.current);
          }
          currentScreenSender.current = userId;
          screenConsumers.current.set(consumer.id, consumer);
        }

        if (!isScreenTrack(trackType)) {
          const userConsumers = consumers.current.get(userId) ?? new Map<TrackType, Consumer>();
          userConsumers.set(trackType, consumer);
          consumers.current.set(userId, userConsumers);
        }

        const handleClose = () => {
          consumedProducers.current.delete(producerId);
          handleConsumerClose(consumer, trackType, userId);
        };
        consumer.on('@close', handleClose);
        consumer.on('transportclose', handleClose);

        return {
          appData,
          track,
        };
      } catch {
        consumedProducers.current.delete(producerId);
        return null;
      }
    },
    [request, publish, handleConsumerClose, removeScreenConsumer],
  );

  const resumeConsumer = useCallback(
    async (userId: string, trackType: TrackType) => {
      const { isExitingRoom } = useWebrtcStore.getState();

      if (isExitingRoom) {
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
      const { isExitingRoom } = useWebrtcStore.getState();

      if (isExitingRoom) {
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
      const device = deviceRef.current;
      if (!device) {
        return;
      }

      const { options } = await request<DtlsResponseType>('/app/signal/dtls', {
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

    if (isScreenTrack(trackType)) {
      screenProducers.current.set(producer.id, producer);
      return producer.id;
    }

    producers.current.set(trackType, producer);
    return producer.id;
  }, []);

  const removeProducer = useCallback((trackType: TrackType) => {
    if (isScreenTrack(trackType)) {
      const removedProducers = Array.from(screenProducers.current.values()).map((producer) => ({
        id: producer.id,
        trackType: (producer.appData as AppData).trackType,
      }));
      screenProducers.current.forEach((p) => p.close());
      screenProducers.current.clear();
      return removedProducers;
    }

    const oldProducer = producers.current.get(trackType);
    if (!oldProducer) {
      return;
    }

    oldProducer.close();

    producers.current.delete(trackType);

    return [{ id: oldProducer.id, trackType }];
  }, []);

  const removeConsumer = useCallback(
    (userId: string, trackType?: TrackType) => {
      if (!trackType) {
        consumers.current.get(userId)?.forEach((c) => c.close());
        consumers.current.delete(userId);

        if (currentScreenSender.current === userId) {
          removeScreenConsumer(userId);
        }
        return;
      }

      if (isScreenTrack(trackType)) {
        removeScreenConsumer(userId);
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

  const replaceProducerTrack = useCallback(
    async (trackType: DeviceKindType, newTrack: MediaStreamTrack | null) => {
      const pending = pendingProduce.current.get(trackType);
      if (pending) {
        await pending.catch(() => {});
      }

      const producer = producers.current.get(trackType);
      if (producer?.track === newTrack) {
        return;
      }

      if (!producer) {
        if (!newTrack) {
          return;
        }

        const producePromise = produceTrack(newTrack, trackType);
        pendingProduce.current.set(trackType, producePromise);
        try {
          const producerId = await producePromise;
          const { deviceEnable } = useDeviceStore.getState();
          if (producerId && !deviceEnable[trackType]) {
            await request('/app/signal/producer/pause', { producerId });
          }
        } finally {
          pendingProduce.current.delete(trackType);
        }
        return;
      }

      try {
        producer.track?.stop();
        await producer.replaceTrack({ track: newTrack });
      } catch {}
    },
    [produceTrack, request],
  );

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

    producers.current.clear();
    screenProducers.current.clear();
    consumers.current.clear();
    screenConsumers.current.clear();
    resumedConsumer.current.clear();
    consumedProducers.current.clear();
    pendingProduce.current.clear();
    currentScreenSender.current = null;
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
