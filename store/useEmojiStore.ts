import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

import { EmojiDataType } from '@/types/emojiType';

interface EmojiState {
  emoji: Map<string, EmojiDataType>;

  addEmoji: (value: EmojiDataType) => string;
  deleteEmoji: (id: string) => void;
}

export const useEmojiStore = create<EmojiState>((set) => ({
  addEmoji: (value) => {
    const id = uuidv4();
    set((state) => {
      const prev = new Map(state.emoji);
      prev.set(id, value);
      return { emoji: prev };
    });
    return id;
  },

  deleteEmoji: (id: string) =>
    set((state) => {
      const prev = new Map(state.emoji);
      prev.delete(id);
      return { emoji: prev };
    }),

  emoji: new Map<string, EmojiDataType>(),
}));
