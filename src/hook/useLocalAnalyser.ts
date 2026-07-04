'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import { createLocalAnalyser, releaseLocalAnalyser } from '@/lib/localAudio';
import { useDeviceStore } from '@/store/useDeviceStore';

const useLocalAnalyser = () => {
  const { audioTrack, setLocalAnalyser } = useDeviceStore(
    useShallow((state) => ({
      audioTrack: state.stream?.getAudioTracks()[0] ?? null,
      setLocalAnalyser: state.setLocalAnalyser,
    })),
  );

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
