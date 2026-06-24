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

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setAnalyser(null);
      return;
    }

    const analysisStream = new MediaStream(audioTracks.map((track) => track.clone()));

    const created = createStreamAnalyser(analysisStream);
    if (!created) {
      analysisStream.getTracks().forEach((track) => track.stop());
      return;
    }

    const { analyser: streamAnalyser, audioContext, source } = created;
    setAnalyser(streamAnalyser);

    return () => {
      setAnalyser(null);
      source.disconnect();
      streamAnalyser.disconnect();
      analysisStream.getTracks().forEach((track) => track.stop());
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream]);

  return analyser;
};

export default useStreamAnalyser;
