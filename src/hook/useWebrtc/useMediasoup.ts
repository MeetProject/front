'use client';

import { Consumer, Producer, Transport } from 'mediasoup-client/types';
import { useCallback, useRef } from 'react';

import {
  requestConsumeParams,
  requestRegisterDTLS,
  requestRegisterRTLS,
  requestResume,
  requestTransportParams,
} from '@/service/webRtc';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { TrackType } from '@/types/deviceType';
import { AppData, Direction } from '@/types/webRtc';

export const useMediasoup = () => {
  const sendTransport = useRef<Transport | null>(null);
  const recvTransport = useRef<Transport | null>(null);

  const producers = useRef<Map<TrackType, Producer>>(new Map());
  const consumers = useRef<Map<string, Set<Consumer>>>(new Map());

  const createTransport = useCallback(async (direction: Direction) => {
    const { device } = useWebrtcStore.getState();
    if (!device) {
      return;
    }

    const option = await requestTransportParams(direction);

    const transport = direction === 'send' ? device.createSendTransport(option) : device.createRecvTransport(option);

    transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
      try {
        await requestRegisterDTLS(transport.id, dtlsParameters);
        callback();
      } catch (e) {
        errback(e as Error);
      }
    });

    if (direction === 'send') {
      transport.on('produce', async ({ appData, rtpParameters }, callback, errback) => {
        try {
          const producerId = await requestRegisterRTLS(transport.id, rtpParameters, appData as AppData);
          callback({ id: producerId });
        } catch (e) {
          errback(e as Error);
        }
      });
      sendTransport.current = transport;
    } else {
      recvTransport.current = transport;
    }
  }, []);

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

  const consumeTrack = useCallback(async (producerId: string) => {
    const { device } = useWebrtcStore.getState();
    if (!recvTransport.current || !device) {
      return null;
    }

    try {
      const consumeParams = await requestConsumeParams(recvTransport.current.id, producerId, device.rtpCapabilities);

      const consumer = await recvTransport.current.consume(consumeParams);
      await requestResume(consumer.id);

      const { appData, track } = consumer;
      const { userId } = appData;
      if (!consumers.current.has(userId)) {
        consumers.current.set(userId, new Set());
      }
      consumers.current.get(userId)!.add(consumer);
      consumer.on('@close', () => {
        const userSet = consumers.current.get(userId);
        if (userSet) {
          userSet.delete(consumer);
          if (userSet.size === 0) {
            consumers.current.delete(userId);
          }
        }
      });

      return {
        appData,
        track,
      };
    } catch {
      return null;
    }
  }, []);

  const removeProducer = useCallback((trackType: TrackType) => {
    const oldProducer = producers.current.get(trackType);
    if (!oldProducer) {
      return;
    }

    oldProducer.close();
    producers.current.delete(trackType);
  }, []);

  const removeConsumer = useCallback((userId: string) => {
    const consumer = consumers.current.get(userId);
    if (!consumer) {
      return;
    }

    consumer.forEach((c) => c.close());
    consumers.current.delete(userId);
  }, []);

  const replaceProducerTrack = useCallback(async (trackType: TrackType, newTrack: MediaStreamTrack) => {
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
