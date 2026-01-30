import { create } from 'zustand';

import { EmojiDataType } from '@/types/emojiType';

interface InteractionState {
  handsUp: boolean;
  emoji: Map<string, EmojiDataType>;

  toggleHandsUp: (value?: boolean) => void;
  addEmoji: (id: string, value: EmojiDataType) => void;
  removeEmoji: (id: string) => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  addEmoji: (id, value) =>
    set((prev) => {
      const newMap = new Map(prev.emoji);
      newMap.set(id, value);
      return { emoji: newMap };
    }),
  emoji: new Map(),
  handsUp: false,
  removeEmoji: (id) =>
    set((prev) => {
      const newMap = new Map(prev.emoji);
      newMap.delete(id);
      return { emoji: newMap };
    }),
  toggleHandsUp: (value) => set((prev) => (value ? { handsUp: value } : { handsUp: !prev.handsUp })),
}));
