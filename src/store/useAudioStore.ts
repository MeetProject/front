import { create } from 'zustand';

import { AttachedAudio, attachAudio, detachAudio, resetAudio } from '@/lib/audioGraph';
import { AppData } from '@/types/session';

interface ConsumerResult {
  appData: AppData;
  track: MediaStreamTrack;
}

interface AudioState {
  audio: Map<string, AttachedAudio>;
  addAudioTrack: (trackInfo: ConsumerResult) => void;
  removeAudioTrack: (id: string) => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  addAudioTrack: (trackInfo) => {
    const {
      appData: { userId },
      track,
    } = trackInfo;

    const attached = attachAudio(userId, track);
    if (!attached) {
      return;
    }

    const newAudioMap = new Map(get().audio);
    newAudioMap.set(userId, attached);

    set({ audio: newAudioMap });
  },
  audio: new Map(),

  removeAudioTrack: (id) => {
    if (!get().audio.has(id)) {
      return;
    }

    detachAudio(id);

    const newAudioMap = new Map(get().audio);
    newAudioMap.delete(id);

    set({ audio: newAudioMap });
  },

  reset: () => {
    resetAudio();
    set({ audio: new Map() });
  },
}));
