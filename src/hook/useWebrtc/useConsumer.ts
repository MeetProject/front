'use client';

import { Consumer } from 'mediasoup-client/types';
import { useCallback, useRef } from 'react';

import { isScreenTrack } from './isScreenTrack';
import { useMediasoupCore } from './useMediasoupCore';

import { useAudioStore } from '@/store/useAudioStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { TrackType } from '@/types/deviceType';
import { AppData, ConsumerParamsResponseType } from '@/types/session';

type Core = ReturnType<typeof useMediasoupCore>;

export const useConsumer = (
  core: Core,
  request: <T>(destination: string, payload: any) => Promise<T>,
  publish: <T>(destination: string, payload?: T | undefined) => boolean,
) => {
  const consumers = useRef<Map<string, Map<TrackType, Consumer>>>(new Map());
  const screenConsumers = useRef<Map<string, Consumer>>(new Map());
  const currentScreenSender = useRef<string | null>(null);
  const resumedConsumer = useRef<Map<string, boolean>>(new Map());
  const consumedProducers = useRef<Set<string>>(new Set());

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

      if (targetId === id || consumedProducers.current.has(producerId)) {
        return null;
      }

      if (!core.getRecvTransport() || !core.getDevice()) {
        await core.awaitRecvReady();
      }

      const device = core.getDevice();
      const transport = core.getRecvTransport();
      if (!transport || !device || consumedProducers.current.has(producerId)) {
        return null;
      }
      consumedProducers.current.add(producerId);

      try {
        const { consumerParams } = await request<ConsumerParamsResponseType>('/app/signal/consumerParams', {
          producerId,
          rtpCapabilities: device.rtpCapabilities,
          targetId,
          transportId: transport.id,
        });

        const consumer = await transport.consume(consumerParams);

        const { appData, track } = consumer;
        const { trackType, userId } = appData as AppData;

        if (trackType !== 'video') {
          const sent = publish('/app/consumer/resume', {
            consumerId: consumer.id,
          });
          if (sent) {
            resumedConsumer.current.set(consumer.id, true);
          }
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
    [core, request, publish, handleConsumerClose, removeScreenConsumer],
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

      const sent = publish('/app/consumer/resume', {
        consumerId,
      });
      if (sent) {
        resumedConsumer.current.set(consumerId, true);
      }
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

      const sent = publish('/app/consumer/pause', {
        consumerId,
      });
      if (sent) {
        resumedConsumer.current.delete(consumerId);
      }
    },
    [publish],
  );

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

  const reset = useCallback(() => {
    consumers.current.clear();
    screenConsumers.current.clear();
    resumedConsumer.current.clear();
    consumedProducers.current.clear();
    currentScreenSender.current = null;
  }, []);

  return {
    consumeTrack,
    pauseConsumer,
    removeConsumer,
    reset,
    resumeConsumer,
  };
};
