'use client';

import useVolume from './useVolume';

import { useAudioStore } from '@/store/useAudioStore';

const useParticipantVolume = (id: string) => {
  const audio = useAudioStore((state) => state.audio.get(id));
  const { isExpand, volume } = useVolume(audio?.analyser ?? null);

  return { isExpand, volume };
};

export default useParticipantVolume;
