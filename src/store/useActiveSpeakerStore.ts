import { create } from 'zustand';

interface ActiveSpeakerState {
  promoted: string[];
  setPromoted: (ids: string[]) => void;
}

export const useActiveSpeakerStore = create<ActiveSpeakerState>((set) => ({
  promoted: [],
  setPromoted: (ids) => set({ promoted: ids }),
}));
