'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { createStreamAnalyser } from '@/util/audio';

interface Options {
  threshold?: number;
  sustainMs?: number;
  cooldownMs?: number;
}

const DEFAULT_THRESHOLD = 12;
const DEFAULT_SUSTAIN_MS = 1500;
const DEFAULT_COOLDOWN_MS = 3 * 60 * 1000;

const useSpeakingWhileMuted = (stream: MediaStream | null, active: boolean, options: Options = {}) => {
  const { cooldownMs = DEFAULT_COOLDOWN_MS, sustainMs = DEFAULT_SUSTAIN_MS, threshold = DEFAULT_THRESHOLD } = options;

  const [showAlert, setShowAlert] = useState(false);

  const showAlertRef = useRef(false);
  const cooldownUntilRef = useRef(0);
  const speakingMsRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);

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
    if (!active || !stream || stream.getAudioTracks().length === 0) {
      speakingMsRef.current = 0;
      if (showAlertRef.current) {
        updateShowAlert(false);
      }
      return;
    }

    const created = createStreamAnalyser(stream);
    if (!created) {
      return;
    }
    const { analyser, audioContext, source } = created;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    lastTsRef.current = performance.now();

    const tick = (ts: number) => {
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      speakingMsRef.current =
        avg > threshold ? speakingMsRef.current + dt : Math.max(0, speakingMsRef.current - dt * 0.5);

      if (!showAlertRef.current && speakingMsRef.current >= sustainMs && Date.now() >= cooldownUntilRef.current) {
        updateShowAlert(true);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      source.disconnect();
      analyser.disconnect();
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  }, [active, stream, threshold, sustainMs, updateShowAlert]);

  return { dismiss, showAlert };
};

export default useSpeakingWhileMuted;
