'use client';

import { useEffect, useRef } from 'react';

import { measureAverage, peekAverage } from '@/lib/audioTicker';
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

    const tick = () => {
      if (document.hidden) {
        return;
      }

      const { audio } = useAudioStore.getState();
      const volumes = new Map<string, number>();

      audio.forEach(({ analyser }, userId) => {
        volumes.set(userId, peekAverage(analyser) ?? measureAverage(analyser));
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
