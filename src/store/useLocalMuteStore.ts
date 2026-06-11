import { create } from 'zustand';

interface LocalMuteState {
  mutedIds: Set<string>;
  mute: (id: string) => void;
  unmute: (id: string) => void;
  reset: () => void;
}

export const useLocalMuteStore = create<LocalMuteState>((set) => ({
  mute: (id) =>
    set((state) => {
      if (state.mutedIds.has(id)) {
        return {};
      }
      const next = new Set(state.mutedIds);
      next.add(id);
      return { mutedIds: next };
    }),
  mutedIds: new Set(),
  reset: () => set({ mutedIds: new Set() }),
  unmute: (id) =>
    set((state) => {
      if (!state.mutedIds.has(id)) {
        return {};
      }
      const next = new Set(state.mutedIds);
      next.delete(id);
      return { mutedIds: next };
    }),
}));
