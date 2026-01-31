'use client';

import { Device } from 'mediasoup-client';
import {
  AppData,
  ConsumerOptions,
  DtlsParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  Transport,
  TransportOptions,
} from 'mediasoup-client/types';
import { useCallback, useRef } from 'react';

import { useUserInfoStore } from '@/store/useUserInfoStore';
import { TrackType } from '@/types/deviceType';

export const useMediasoup = () => {
  const deviceRef = useRef<Device | null>(null);
  const sendTransport = useRef<Transport | null>(null);
  const recvTransport = useRef<Transport | null>(null);

  const initDevice = useCallback(async (routerRtpCapabilities: RtpCapabilities) => {
    if (deviceRef.current) {
      return;
    }
    const device = new Device();
    await device.load({ routerRtpCapabilities });
    deviceRef.current = device;
  }, []);

  const createTransport = useCallback(
    (
      direction: 'send' | 'recv',
      option: TransportOptions<AppData>,
      onConnect: (
        args_0: { dtlsParameters: DtlsParameters },
        args_1: () => void,
        args_2: (error: Error) => void,
      ) => void,
      onProduce?: (
        args_0: { kind: MediaKind; rtpParameters: RtpParameters; appData: AppData },
        args_1: ({ id }: { id: string }) => void,
        args_2: (error: Error) => void,
      ) => void,
    ) => {
      if (!deviceRef.current) {
        return;
      }

      const transport =
        direction === 'send'
          ? deviceRef.current.createSendTransport(option)
          : deviceRef.current.createRecvTransport(option);

      transport.on('connect', onConnect);

      if (direction === 'send' && onProduce) {
        transport.on('produce', onProduce);
        sendTransport.current = transport;
      } else {
        recvTransport.current = transport;
      }
    },
    [],
  );

  const initMediasoup = useCallback(
    async (
      routerRtpCapabilities: RtpCapabilities,
      options: {
        sendTransportOption: TransportOptions;
        recvTransportOption: TransportOptions;
      },
      handlers: {
        onConnectSend: (
          args_0: { dtlsParameters: DtlsParameters },
          args_1: () => void,
          args_2: (error: Error) => void,
        ) => void;
        onProduce: (
          args_0: { kind: MediaKind; rtpParameters: RtpParameters; appData: AppData },
          args_1: ({ id }: { id: string }) => void,
          args_2: (error: Error) => void,
        ) => void;
        onConnectRecv: (
          args_0: { dtlsParameters: DtlsParameters },
          args_1: () => void,
          args_2: (error: Error) => void,
        ) => void;
      },
    ) => {
      await initDevice(routerRtpCapabilities);
      createTransport('send', options.sendTransportOption, handlers.onConnectSend, handlers.onProduce);
      createTransport('recv', options.recvTransportOption, handlers.onConnectRecv);
    },
    [initDevice, createTransport],
  );

  const produceTrack = useCallback(async (track: MediaStreamTrack, trackType: TrackType) => {
    const { userId } = useUserInfoStore.getState();
    if (!sendTransport.current || !userId) {
      return;
    }

    const producer = await sendTransport.current.produce({
      appData: { trackType, userId },
      track,
    });

    return producer.id;
  }, []);

  const consumeTrack = useCallback(
    async (
      producerId: string,
      getConsumeParams: (
        transportId: string,
        producerId: string,
        rtpCapabilities: RtpCapabilities,
      ) => Promise<ConsumerOptions<AppData>>,
      sendResumeConsumer: (consumerId: string) => Promise<void>,
    ) => {
      if (!recvTransport.current || !deviceRef.current) {
        return;
      }

      const consumeParams = await getConsumeParams(
        recvTransport.current.id,
        producerId,
        deviceRef.current.rtpCapabilities,
      );

      const consumer = await recvTransport.current.consume(consumeParams);
      await sendResumeConsumer(consumer.id);

      const { appData, track } = consumer;
      return {
        appData,
        track,
      };
    },
    [],
  );

  const disconnectMediasoup = useCallback(() => {
    sendTransport.current?.close();
    recvTransport.current?.close();
    sendTransport.current = null;
    recvTransport.current = null;
    deviceRef.current = null;
  }, []);

  return { consumeTrack, disconnectMediasoup, initMediasoup, produceTrack };
};
