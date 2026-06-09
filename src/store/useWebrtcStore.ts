import { create } from 'zustand';

interface WebrtcState {
  isExitingRoom: boolean;
}

export const useWebrtcStore = create<WebrtcState>(() => ({
  isExitingRoom: false,
}));
