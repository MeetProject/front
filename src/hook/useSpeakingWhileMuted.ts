'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { subscribeAudioTick } from '@/lib/audioTicker';
import { useDeviceStore } from '@/store/useDeviceStore';

interface Options {
  threshold?: number;
  sustainMs?: number;
  cooldownMs?: number;
}

const DEFAULT_THRESHOLD = 12;
const DEFAULT_SUSTAIN_MS = 1500;
const DEFAULT_COOLDOWN_MS = 3 * 60 * 1000;

const useSpeakingWhileMuted = (active: boolean, options: Options = {}) => {
  const { cooldownMs = DEFAULT_COOLDOWN_MS, sustainMs = DEFAULT_SUSTAIN_MS, threshold = DEFAULT_THRESHOLD } = options;

  const analyser = useDeviceStore((state) => state.localAnalyser);

  const [showAlert, setShowAlert] = useState(false);

  const showAlertRef = useRef(false);
  const cooldownUntilRef = useRef(0);
  const speakingMsRef = useRef(0);

  const updateShowAlert = useCallback((value: boolean) => {
    showAlertRef.current = value;
    setShowAlert(value);
  }, []);

  const dismiss = useCallback(() => {
    cooldownUntilRef.current = Date.now() + cooldownMs;
    speakingMsRef.current = 0;
    updateShowAlert(false);
  }, [cooldownMs, updateShowAlert]);

  useEffect(() => {
    if (!active || !analyser) {
      speakingMsRef.current = 0;
      if (showAlertRef.current) {
        updateShowAlert(false);
      }
      return;
    }

    const timeState = { last: performance.now() };

    const unsubscribe = subscribeAudioTick({
      getAnalyser: () => analyser,
      onValue: (avg) => {
        const now = performance.now();
        const dt = now - timeState.last;
        timeState.last = now;

        speakingMsRef.current =
          avg > threshold ? speakingMsRef.current + dt : Math.max(0, speakingMsRef.current - dt * 0.5);

        if (!showAlertRef.current && speakingMsRef.current >= sustainMs && Date.now() >= cooldownUntilRef.current) {
          updateShowAlert(true);
        }
      },
    });

    return unsubscribe;
  }, [active, analyser, threshold, sustainMs, updateShowAlert]);

  return { dismiss, showAlert };
};

export default useSpeakingWhileMuted;
