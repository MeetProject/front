'use client';

import { useCallback, useMemo } from 'react';

import { useConsumer } from './useConsumer';
import { useMediasoupCore } from './useMediasoupCore';
import { useProducer } from './useProducer';

export const useMediasoup = (
  publish: <T>(destination: string, payload?: T | undefined) => boolean,
  request: <T>(destination: string, payload: any) => Promise<T>,
) => {
  const core = useMediasoupCore(request);

  const {
    produceTrack,
    removeProducer,
    replaceProducerTrack,
    reset: resetProducer,
    toggleProducerTrack,
  } = useProducer(core, request);

  const {
    consumeTrack,
    pauseConsumer,
    removeConsumer,
    reset: resetConsumer,
    resumeConsumer,
  } = useConsumer(core, request, publish);

  const disconnectTransport = useCallback(() => {
    core.closeTransport();
    resetProducer();
    resetConsumer();
  }, [core, resetProducer, resetConsumer]);

  return useMemo(
    () => ({
      clearDevice: core.clearDevice,
      consumeTrack,
      createTransport: core.createTransport,
      disconnectTransport,
      initDevice: core.initDevice,
      pauseConsumer,
      produceTrack,
      removeConsumer,
      removeProducer,
      replaceProducerTrack,
      resumeConsumer,
      toggleProducerTrack,
    }),
    [
      core,
      consumeTrack,
      disconnectTransport,
      pauseConsumer,
      produceTrack,
      removeConsumer,
      removeProducer,
      replaceProducerTrack,
      resumeConsumer,
      toggleProducerTrack,
    ],
  );
};
