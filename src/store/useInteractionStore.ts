import { create } from 'zustand';

import { EmojiType } from '@/types/emojiType';

interface InteractionState {
  handsUp: boolean;
  emoji: EmojiType | null;
  timer: NodeJS.Timeout | null;

  toggleHandsUp: (value?: boolean) => void;
  setEmoji: (value: EmojiType) => void;
}

export const useInteractionStore = create<InteractionState>((set, get) => ({
  emoji: null,
  handsUp: false,
  setEmoji: (value) => {
    const currentTimer = get().timer;
    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    set({ emoji: value });
    const newTimer = setTimeout(() => {
      set({ emoji: null, timer: null });
    }, 8000);

    set({ timer: newTimer });
  },
  timer: null,
  toggleHandsUp: (value) => set((prev) => (value ? { handsUp: value } : { handsUp: !prev.handsUp })),
}));
