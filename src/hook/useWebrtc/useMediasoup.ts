'use client';

import { Device } from 'mediasoup-client';
import { Transport } from 'mediasoup-client/types';
import { useCallback, useRef } from 'react';

import {
  requestCapability,
  requestConsumeParams,
  requestRegisterDTLS,
  requestRegisterRTLS,
  requestResume,
  requestTransportParams,
} from '@/service/webRtc';
import { TrackType } from '@/types/deviceType';
import { Direction } from '@/types/webRtc';

export const useMediasoup = () => {
  const deviceRef = useRef<Device | null>(null);
  const sendTransport = useRef<Transport | null>(null);
  const recvTransport = useRef<Transport | null>(null);

  const initDevice = useCallback(async () => {
    if (deviceRef.current) {
      return;
    }
    const device = new Device();
    const routerRtpCapabilities = await requestCapability();
    await device.load({ routerRtpCapabilities });
    deviceRef.current = device;
  }, []);

  const createTransport = useCallback(async (direction: Direction) => {
    if (!deviceRef.current) {
      return;
    }

    const option = await requestTransportParams(direction);

    const transport =
      direction === 'send'
        ? deviceRef.current.createSendTransport(option)
        : deviceRef.current.createRecvTransport(option);

    transport.on('connect', async ({ dtlsParameters }) => requestRegisterDTLS(transport.id, dtlsParameters));

    if (direction === 'send') {
      transport.on('produce', async ({ appData, rtpParameters }) =>
        requestRegisterRTLS(transport.id, rtpParameters, appData),
      );
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

    return producer.id;
  }, []);

  const consumeTrack = useCallback(async (producerId: string) => {
    if (!recvTransport.current || !deviceRef.current) {
      return null;
    }

    const consumeParams = await requestConsumeParams(
      recvTransport.current.id,
      producerId,
      deviceRef.current.rtpCapabilities,
    );

    const consumer = await recvTransport.current.consume(consumeParams);
    await requestResume(consumer.id);

    const { appData, track } = consumer;
    return {
      appData,
      track,
    };
  }, []);

  const disconnectTransport = useCallback(() => {
    sendTransport.current?.close();
    recvTransport.current?.close();
    sendTransport.current = null;
    recvTransport.current = null;
  }, []);

  const disconnectMediasoup = useCallback(() => {
    deviceRef.current = null;
  }, []);

  return { consumeTrack, createTransport, disconnectMediasoup, disconnectTransport, initDevice, produceTrack };
};
