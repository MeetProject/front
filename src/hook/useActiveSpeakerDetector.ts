'use client';

import { useEffect, useRef } from 'react';

import { useActiveSpeakerStore } from '@/store/useActiveSpeakerStore';
import { useAudioStore } from '@/store/useAudioStore';
import { resolveActiveSpeakers, SpeakerDetectionConfig, SpeakerDetectionState } from '@/util/activeSpeaker';

const INTERVAL_MS = 200; // 발화 감지 주기(rAF 불필요, 5회/초)

const CONFIG: SpeakerDetectionConfig = {
  cooldownMs: 6000, // 마지막 발화 후 승격 유지 시간(flapping 방지)
  intervalMs: INTERVAL_MS,
  sustainMs: 400, // 이 시간 이상 지속 발화해야 인정(블립 무시)
  threshold: 12, // 평균 주파수 에너지 임계값(환경에 맞게 튜닝 가능)
};

const EMPTY: string[] = [];

/**
 * 모든 참가자의 오디오 analyser를 단일 루프로 감시해 활성 화자를 산정한다.
 * - 판정 정책은 resolveActiveSpeakers(순수 함수)에 위임한다.
 * - setState 없이 ref만 갱신하다가, 승격 집합이 "실제로 바뀔 때만" store에 커밋한다.
 * - enabled=false(오버플로우 없음)이면 루프를 돌리지 않는다.
 */
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

        let sum = 0;
        for (let i = 0; i < bins; i++) {
          sum += buf[i];
        }
        volumes.set(userId, sum / bins);
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
