import { create } from 'zustand';

import { getRandomHexColor } from '@/util/random';

interface UserInfoState {
  id: string | null;
  name: string | null;
  color: string | null;
  setUserInfo: (id: string, name: string) => void;
}

export const useUserInfoStore = create<UserInfoState>((set) => ({
  color: null,
  id: null,
  name: null,
  setUserInfo: (id, name) =>
    set(() => ({
      color: getRandomHexColor(),
      id,
      name,
    })),
}));
