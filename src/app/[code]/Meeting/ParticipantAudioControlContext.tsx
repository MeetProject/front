'use client';

import { createContext, useContext } from 'react';

interface ParticipantAudioControlValue {
  toggleMute: (id: string) => void;
}

const ParticipantAudioControlContext = createContext<ParticipantAudioControlValue | null>(null);

export const ParticipantAudioControlProvider = ParticipantAudioControlContext.Provider;

export const useParticipantAudioControl = () => {
  const value = useContext(ParticipantAudioControlContext);
  if (!value) {
    throw new Error('useParticipantAudioControl must be used within ParticipantAudioControlProvider');
  }
  return value;
};
