import { create } from 'zustand';

interface DrawerState {
  cc: boolean;
  emoji: boolean;
  toggleCc: () => void;
  toggleEmoji: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  cc: false,
  emoji: false,

  toggleCc: () => set((state) => ({ cc: !state.cc })),
  toggleEmoji: () => set((state) => ({ emoji: !state.emoji })),
}));
