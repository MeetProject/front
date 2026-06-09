'use client';

import { useEffect, useRef } from 'react';

import { useActiveSpeakerStore } from '@/store/useActiveSpeakerStore';
import { useAudioStore } from '@/store/useAudioStore';
import { resolveActiveSpeakers, SpeakerDetectionConfig, SpeakerDetectionState } from '@/util/audio';

const INTERVAL_MS = 200;

const CONFIG: SpeakerDetectionConfig = {
  cooldownMs: 6000,
  intervalMs: INTERVAL_MS,
  sustainMs: 400,
  threshold: 12,
};

const EMPTY: string[] = [];

const useActiveSpeakerDetector = (enabled: boolean, maxSpeakers: number) => {
  const stateRef = useRef<SpeakerDetectionState>({ lastActive: new Map(), sustain: new Map() });
  const prevKey = useRef<string>('');

  useEffect(() => {
    const { setPromoted } = useActiveSpeakerStore.getState();
    const state = stateRef.current;

    const reset = () => {
      state.lastActive.clear();
      state.sustain.clear();
      prevKey.current = '';
      if (useActiveSpeakerStore.getState().promoted.length !== 0) {
        setPromoted(EMPTY);
      }
    };

    if (!enabled || maxSpeakers <= 0) {
      reset();
      return;
    }

    const buf = new Uint8Array(1024);

    const tick = () => {
      if (document.hidden) {
        return;
      }

      const { audio } = useAudioStore.getState();
      const volumes = new Map<string, number>();

      audio.forEach(({ analyser }, userId) => {
        const bins = Math.min(analyser.frequencyBinCount, buf.length);
        analyser.getByteFrequencyData(buf);

        const avg = buf.subarray(0, bins).reduce((sum, value) => sum + value, 0) / bins;
        volumes.set(userId, avg);
      });

      const promoted = resolveActiveSpeakers(volumes, state, performance.now(), maxSpeakers, CONFIG);

      const key = promoted.join(',');
      if (key !== prevKey.current) {
        prevKey.current = key;
        setPromoted(promoted.length === 0 ? EMPTY : promoted);
      }
    };

    const intervalId = setInterval(tick, INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      reset();
    };
  }, [enabled, maxSpeakers]);
};

export default useActiveSpeakerDetector;
