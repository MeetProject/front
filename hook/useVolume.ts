'use client';

import { useEffect, useState, useRef } from 'react';

const useVolume = (stream: MediaStream | null | undefined) => {
  const rafRef = useRef<number | null>(null);
  const prevVolumeRef = useRef(0);

  const [volume, setVolume] = useState(0);
  const [isExpand, setIsExpand] = useState(false);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setVolume(0);
      setIsExpand(false);
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 256;

    source.connect(analyser);

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

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    updateVolume();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      source.disconnect();
      analyser.disconnect();
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream]);

  return { isExpand, volume };
};

export default useVolume;
