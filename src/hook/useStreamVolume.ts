'use client';

import { useEffect, useState } from 'react';

import useVolume from '@/hook/useVolume';

const useStreamVolume = (stream: MediaStream | null) => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const { isExpand, volume } = useVolume(analyser);

  useEffect(() => {
    if (!stream) {
      return;
    }
    const audioContext = new AudioContext();
    const audioAnalyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(audioAnalyser);
    setAnalyser(audioAnalyser);

    return () => {
      source.disconnect();
      audioAnalyser.disconnect();

      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream]);

  return { isExpand, volume };
};

export default useStreamVolume;
