'use client';

import { useEffect, useRef } from 'react';

import { subscribeAudioTick } from '@/lib/audioTicker';

const SMOOTHING = 0.15;

const useVolumeMeter = <T extends HTMLElement>(analyser: AnalyserNode | null, map?: (value: number) => number) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    if (!analyser) {
      el.style.setProperty('--meter', '0');
      return;
    }

    const state = { prev: 0 };

    const unsubscribe = subscribeAudioTick({
      getAnalyser: () => analyser,
      onValue: (average) => {
        state.prev = state.prev * (1 - SMOOTHING) + average * SMOOTHING;
        el.style.setProperty('--meter', String(map?.(state.prev) ?? state.prev));
      },
    });

    return () => {
      unsubscribe();
      el.style.setProperty('--meter', '0');
    };
  }, [analyser, map]);

  return ref;
};

export default useVolumeMeter;
