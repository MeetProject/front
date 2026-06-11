import { create } from 'zustand';

import { EmojiDataType } from '@/types/emojiType';

interface InteractionState {
  handsUp: Set<string>;
  emoji: Map<string, EmojiDataType>;

  toggleHandsUp: (id: string) => void;
  addEmoji: (id: string, value: EmojiDataType) => void;
  removeEmoji: (id: string) => void;
  reset: () => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  addEmoji: (id, value) =>
    set((prev) => {
      const newMap = new Map(prev.emoji);
      newMap.set(id, value);
      return { emoji: newMap };
    }),
  emoji: new Map(),
  handsUp: new Set([]),
  removeEmoji: (id) =>
    set((prev) => {
      const newMap = new Map(prev.emoji);
      newMap.delete(id);
      return { emoji: newMap };
    }),
  reset: () => set({ emoji: new Map(), handsUp: new Set() }),

  toggleHandsUp: (id) =>
    set((prev) => {
      const newSet = new Set(prev.handsUp);

      if (newSet.has(id)) {
        newSet.delete(id);
        return { handsUp: newSet };
      }

      newSet.add(id);
      return { handsUp: newSet };
    }),
}));
