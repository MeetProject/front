'use client';

import { useEffect } from 'react';

import { resumeAudioContext } from '@/lib/audioGraph';
import { resumeLocalAnalyser } from '@/lib/localAudio';

const useResumeAudioOnUserGesture = () => {
  useEffect(() => {
    const resumeSuspendedAudio = () => {
      resumeAudioContext();
      resumeLocalAnalyser();
    };

    window.addEventListener('pointerdown', resumeSuspendedAudio);
    window.addEventListener('keydown', resumeSuspendedAudio);
    window.addEventListener('touchend', resumeSuspendedAudio);

    return () => {
      window.removeEventListener('pointerdown', resumeSuspendedAudio);
      window.removeEventListener('keydown', resumeSuspendedAudio);
      window.removeEventListener('touchend', resumeSuspendedAudio);
    };
  }, []);
};

export default useResumeAudioOnUserGesture;
