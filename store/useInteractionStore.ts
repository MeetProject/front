import { create } from 'zustand';

interface InteractionState {
  handsUp: boolean;

  toggleHandsUp: (value?: boolean) => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  handsUp: false,
  toggleHandsUp: (value) => set((prev) => (value ? { handsUp: value } : { handsUp: !prev.handsUp })),
}));
