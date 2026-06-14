'use client';

import { Device } from 'mediasoup-client';
import { RtpCapabilities, Transport } from 'mediasoup-client/types';
import { useCallback, useMemo, useRef } from 'react';

import { Direction, DtlsResponseType } from '@/types/session';

export const useMediasoupCore = (request: <T>(destination: string, payload: any) => Promise<T>) => {
  const deviceRef = useRef<Device | null>(null);
  const sendTransport = useRef<Transport | null>(null);
  const recvTransport = useRef<Transport | null>(null);
  const recvReady = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  const sendReady = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);

  const getRecvReady = useCallback(() => {
    if (!recvReady.current) {
      const { promise, resolve } = Promise.withResolvers<void>();
      recvReady.current = { promise, resolve };
    }
    return recvReady.current;
  }, []);

  const getSendReady = useCallback(() => {
    if (!sendReady.current) {
      const { promise, resolve } = Promise.withResolvers<void>();
      sendReady.current = { promise, resolve };
    }
    return sendReady.current;
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
        getRecvReady().resolve();
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
      getSendReady().resolve();
    },
    [request, getRecvReady, getSendReady],
  );

  const closeTransport = useCallback(() => {
    sendTransport.current?.close();
    recvTransport.current?.close();
    sendTransport.current = null;
    recvTransport.current = null;

    recvReady.current?.resolve();
    recvReady.current = null;

    sendReady.current?.resolve();
    sendReady.current = null;
  }, []);

  const getDevice = useCallback(() => deviceRef.current, []);
  const getSendTransport = useCallback(() => sendTransport.current, []);
  const getRecvTransport = useCallback(() => recvTransport.current, []);
  const awaitSendReady = useCallback(() => getSendReady().promise, [getSendReady]);
  const awaitRecvReady = useCallback(() => getRecvReady().promise, [getRecvReady]);

  return useMemo(
    () => ({
      awaitRecvReady,
      awaitSendReady,
      clearDevice,
      closeTransport,
      createTransport,
      getDevice,
      getRecvTransport,
      getSendTransport,
      initDevice,
    }),
    [
      awaitRecvReady,
      awaitSendReady,
      clearDevice,
      closeTransport,
      createTransport,
      getDevice,
      getRecvTransport,
      getSendTransport,
      initDevice,
    ],
  );
};
