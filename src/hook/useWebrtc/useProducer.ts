'use client';

import { Producer } from 'mediasoup-client/types';
import { useCallback, useRef } from 'react';

import { isScreenTrack } from './isScreenTrack';
import { useMediasoupCore } from './useMediasoupCore';

import { useDeviceStore } from '@/store/useDeviceStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { DeviceKindType, TrackType } from '@/types/deviceType';
import { AppData } from '@/types/session';

type Core = ReturnType<typeof useMediasoupCore>;

export const useProducer = (core: Core, request: <T>(destination: string, payload: any) => Promise<T>) => {
  const producers = useRef<Map<DeviceKindType, Producer>>(new Map());
  const screenProducers = useRef<Map<string, Producer>>(new Map());
  const trackChain = useRef<Map<DeviceKindType, Promise<void>>>(new Map());

  const produceTrack = useCallback(
    async (track: MediaStreamTrack, trackType: TrackType) => {
      const { userId } = useUserInfoStore.getState();
      if (!userId || track.readyState === 'ended') {
        return '';
      }

      if (!core.getSendTransport()) {
        await core.awaitSendReady();
      }

      const transport = core.getSendTransport();
      if (!transport) {
        return '';
      }

      try {
        const producer = await transport.produce({
          appData: { trackType, userId },
          track,
        });

        if (isScreenTrack(trackType)) {
          screenProducers.current.set(producer.id, producer);
          return producer.id;
        }

        producers.current.set(trackType, producer);
        return producer.id;
      } catch {
        return '';
      }
    },
    [core],
  );

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

  const enqueue = useCallback((trackType: DeviceKindType, task: () => Promise<void>): Promise<void> => {
    const prev = trackChain.current.get(trackType) ?? Promise.resolve();
    const next = prev.then(task, task);
    trackChain.current.set(
      trackType,
      next.catch(() => {}),
    );
    return next;
  }, []);

  const replaceProducerTrack = useCallback(
    (trackType: DeviceKindType, newTrack: MediaStreamTrack | null) =>
      enqueue(trackType, async () => {
        const producer = producers.current.get(trackType);
        if (producer?.track === newTrack) {
          return;
        }

        if (!producer) {
          if (!newTrack) {
            return;
          }

          const producerId = await produceTrack(newTrack, trackType);
          const { deviceEnable } = useDeviceStore.getState();
          if (producerId && !deviceEnable[trackType]) {
            await request('/app/signal/producer/pause', { producerId });
          }
          return;
        }

        try {
          const oldTrack = producer.track;
          await producer.replaceTrack({ track: newTrack });
          if (oldTrack && oldTrack !== newTrack) {
            oldTrack.stop();
          }
        } catch {}
      }),
    [enqueue, produceTrack, request],
  );

  const toggleProducerTrack = useCallback(
    (trackType: DeviceKindType, value?: boolean) =>
      enqueue(trackType, async () => {
        const producer = producers.current.get(trackType);
        if (!producer) {
          throw new Error(`${trackType} producer가 없습니다.`);
        }

        const { deviceEnable } = useDeviceStore.getState();
        const shouldResume = value !== undefined ? value : !deviceEnable[trackType];
        const endPoint = shouldResume ? '/app/signal/producer/resume' : '/app/signal/producer/pause';

        await request(endPoint, { producerId: producer.id });
      }),
    [enqueue, request],
  );

  const reset = useCallback(() => {
    producers.current.clear();
    screenProducers.current.clear();
    trackChain.current.clear();
  }, []);

  return {
    produceTrack,
    removeProducer,
    replaceProducerTrack,
    reset,
    toggleProducerTrack,
  };
};
