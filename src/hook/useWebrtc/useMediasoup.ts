'use client';

import { Producer, Transport } from 'mediasoup-client/types';
import { useCallback, useRef } from 'react';

import {
  requestConsumeParams,
  requestRegisterDTLS,
  requestRegisterRTLS,
  requestResume,
  requestTransportParams,
} from '@/service/webRtc';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { TrackType } from '@/types/deviceType';
import { Direction } from '@/types/webRtc';

export const useMediasoup = () => {
  const sendTransport = useRef<Transport | null>(null);
  const recvTransport = useRef<Transport | null>(null);
  const producers = useRef<Map<TrackType, Producer>>(new Map());

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
          const producerId = await requestRegisterRTLS(transport.id, rtpParameters, appData);
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
    if (!sendTransport.current) {
      return '';
    }

    const producer = await sendTransport.current.produce({
      appData: { trackType },
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

    const consumeParams = await requestConsumeParams(recvTransport.current.id, producerId, device.rtpCapabilities);

    const consumer = await recvTransport.current.consume(consumeParams);
    await requestResume(consumer.id);

    const { appData, track } = consumer;
    return {
      appData,
      track,
    };
  }, []);

  const removeProducer = useCallback((trackType: TrackType) => {
    const oldProducer = producers.current.get(trackType);
    if (!oldProducer) {
      return;
    }

    oldProducer.close();
    producers.current.delete(trackType);
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
    removeProducer,
    replaceProducerTrack,
  };
};
