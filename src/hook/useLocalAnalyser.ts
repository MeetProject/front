'use client';

import { useEffect } from 'react';

import { createLocalAnalyser, releaseLocalAnalyser } from '@/lib/localAudio';
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
};

export default useLocalAnalyser;
