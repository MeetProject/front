'use client';

import { useEffect } from 'react';

import { createLocalAnalyser, releaseLocalAnalyser } from '@/lib/localAudio';
import { useDeviceStore } from '@/store/useDeviceStore';

const useLocalAnalyser = () => {
  const audioTrack = useDeviceStore((state) => state.stream?.getAudioTracks()[0] ?? null);
  const setLocalAnalyser = useDeviceStore((state) => state.setLocalAnalyser);

  useEffect(() => {
    if (!audioTrack) {
      setLocalAnalyser(null);
      return;
    }

    setLocalAnalyser(createLocalAnalyser(new MediaStream([audioTrack])));

    return () => {
      releaseLocalAnalyser();
      setLocalAnalyser(null);
    };
  }, [audioTrack, setLocalAnalyser]);
};

export default useLocalAnalyser;
