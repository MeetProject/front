import { create } from 'zustand';

import { DrawerKeyType, RIGHT_PANEL_KEYS } from '@/types/drawerType';

const RIGHT_PANEL_STATE = Object.fromEntries(RIGHT_PANEL_KEYS.map((key) => [key, false]));

interface DrawerState {
  cc: boolean;
  emoji: boolean;
  info: boolean;
  chat: boolean;
  toggleDrawer: (type: DrawerKeyType) => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  cc: false,
  chat: false,
  emoji: false,
  info: false,

  toggleDrawer: (type) =>
    set((state) => {
      if (Object.hasOwn(RIGHT_PANEL_STATE, type)) {
        return { ...RIGHT_PANEL_STATE, [type]: !state[type] };
      }
      return { [type]: !state[type] };
    }),
}));
