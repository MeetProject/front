import { create } from 'zustand';

import { DrawerKeyType, RIGHT_DRAWER_KEYS } from '@/types/drawerType';

const RIGHT_DRAWER_STATE = Object.fromEntries(RIGHT_DRAWER_KEYS.map((key) => [key, false]));

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
      if (Object.hasOwn(RIGHT_DRAWER_STATE, type)) {
        return { ...RIGHT_DRAWER_STATE, [type]: !state[type] };
      }
      return { [type]: !state[type] };
    }),
}));
