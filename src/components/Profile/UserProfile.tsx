import { useShallow } from 'zustand/shallow';

import ProfileIcon from './ProfileIcon';

import { useUserInfoStore } from '@/store/useUserInfoStore';

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className }: UserProfileProps) {
  const { userColor, userName } = useUserInfoStore(
    useShallow((state) => ({
      userColor: state.userColor,
      userName: state.userName,
    })),
  );

  if (!userColor || !userName) {
    return null;
  }

  return <ProfileIcon className={className} color={userColor} name={userName} />;
}
