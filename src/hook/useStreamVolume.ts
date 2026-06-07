'use client';

import { useEffect, useState } from 'react';

import useVolume from '@/hook/useVolume';
import { createStreamAnalyser } from '@/util/audio';

const useStreamVolume = (stream: MediaStream | null) => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const { isExpand, volume } = useVolume(analyser);

  useEffect(() => {
    if (!stream) {
      return;
    }
    const created = createStreamAnalyser(stream);
    if (!created) {
      return;
    }
    const { analyser: audioAnalyser, audioContext, source } = created;
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
