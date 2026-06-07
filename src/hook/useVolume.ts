'use client';

import { useEffect, useState, useRef } from 'react';

const useVolume = (analyser: AnalyserNode | null) => {
  const rafRef = useRef<number | null>(null);
  const prevVolumeRef = useRef(0);

  const [volume, setVolume] = useState(0);
  const [isExpand, setIsExpand] = useState(false);

  useEffect(() => {
    if (!analyser) {
      setVolume(0);
      setIsExpand(false);
      return;
    }

    analyser.fftSize = 256;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);

      const sum = dataArray.reduce((a, b) => a + b, 0);
      const avg = sum / dataArray.length;

      const smoothingFactor = 0.15;
      const smoothedVolume = prevVolumeRef.current * (1 - smoothingFactor) + avg * smoothingFactor;

      if (Math.abs(prevVolumeRef.current - smoothedVolume) > 0.1) {
        setVolume(smoothedVolume);
        prevVolumeRef.current = smoothedVolume;
      }

      rafRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [analyser]);

  return { isExpand, volume };
};

export default useVolume;
