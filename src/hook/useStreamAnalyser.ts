'use client';

import { useEffect, useState } from 'react';

import { createStreamAnalyser } from '@/util/audio';

const useStreamAnalyser = (stream: MediaStream | null) => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (!stream) {
      setAnalyser(null);
      return;
    }

    const created = createStreamAnalyser(stream);
    if (!created) {
      setAnalyser(null);
      return;
    }

    const { analyser: streamAnalyser, audioContext, source } = created;
    setAnalyser(streamAnalyser);

    return () => {
      setAnalyser(null);
      source.disconnect();
      streamAnalyser.disconnect();
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  }, [stream]);

  return analyser;
};

export default useStreamAnalyser;
