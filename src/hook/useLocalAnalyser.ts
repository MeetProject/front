'use client';

import { useEffect } from 'react';

import { createLocalAnalyser, releaseLocalAnalyser, resumeLocalAnalyser } from '@/lib/localAudio';
import { useDeviceStore } from '@/store/useDeviceStore';

const useLocalAnalyser = () => {
  const stream = useDeviceStore((state) => state.stream);
  const setLocalAnalyser = useDeviceStore((state) => state.setLocalAnalyser);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setLocalAnalyser(null);
      return;
    }

    setLocalAnalyser(createLocalAnalyser(stream));

    return () => {
      releaseLocalAnalyser();
      setLocalAnalyser(null);
    };
  }, [stream, setLocalAnalyser]);

  useEffect(() => {
    const unlock = () => resumeLocalAnalyser();

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchend', unlock);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchend', unlock);
    };
  }, []);
};

export default useLocalAnalyser;
