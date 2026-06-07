'use client';

import { useAudioStore } from '@/store/useAudioStore';

const useParticipantAnalyser = (id: string) => useAudioStore((state) => state.audio.get(id)?.analyser ?? null);

export default useParticipantAnalyser;
