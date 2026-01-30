'use client';

import { useShallow } from 'zustand/shallow';

import ParticipantCard from '../_shared/ParticipantCard';

import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function UserCard() {
  const { userId, userName } = useUserInfoStore(
    useShallow((state) => ({
      userId: state.userId,
      userName: state.userName,
    })),
  );

  if (!userName || !userId) {
    return null;
  }
  return <ParticipantCard isMe={true} name={userName} option={{ audio: true }} userId={userId} />;
}
