import { create } from 'zustand';

interface UserInfoState {
  userId: string | null;
  userName: string | null;
  userColor: string | null;
  setUserInfo: (userId: string, userName: string, userColor: string) => void;
}

export const useUserInfoStore = create<UserInfoState>((set) => ({
  setUserInfo: (userId, userName, userColor) =>
    set(() => ({
      userColor,
      userId,
      userName,
    })),
  userColor: '#aaccff',
  userId: 'user_01',
  userName: 'user1',
}));
