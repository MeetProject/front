'use client';

import { useShallow } from 'zustand/shallow';

import ParticipantCard from '../_shared/ParticipantCard';

import { useDeviceStore } from '@/store/useDeviceStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function UserCard() {
  const { userColor, userId, userName } = useUserInfoStore(
    useShallow((state) => ({
      userColor: state.userColor,
      userId: state.userId,
      userName: state.userName,
    })),
  );
  const deviceEnable = useDeviceStore((state) => state.deviceEnable);
  return (
    <>
      {userId && userName && userColor && (
        <ParticipantCard
          color={userColor}
          isMe={true}
          name={userName}
          option={{ audio: deviceEnable.audio }}
          userId={userId}
        />
      )}
    </>
  );
}
