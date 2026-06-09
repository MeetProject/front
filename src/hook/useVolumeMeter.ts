'use client';

import { useEffect, useRef } from 'react';

const SMOOTHING = 0.15;
const FRAME_MS = 33;

const useVolumeMeter = <T extends HTMLElement>(analyser: AnalyserNode | null, map?: (value: number) => number) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!analyser || !el) {
      el?.style.setProperty('--meter', '0');
      return;
    }

    analyser.fftSize = 256;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const state = { last: 0, prev: 0, raf: 0 };

    const tick = (timestamp: number) => {
      state.raf = requestAnimationFrame(tick);
      if (timestamp - state.last < FRAME_MS) {
        return;
      }
      state.last = timestamp;

      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, value) => sum + value, 0) / data.length;
      state.prev = state.prev * (1 - SMOOTHING) + avg * SMOOTHING;

      el.style.setProperty('--meter', String(map?.(state.prev) ?? state.prev));
    };

    state.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(state.raf);
      el.style.setProperty('--meter', '0');
    };
  }, [analyser, map]);

  return ref;
};

export default useVolumeMeter;
