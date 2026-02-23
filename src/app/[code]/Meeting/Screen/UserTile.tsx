'use client';

import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

import { useDeviceStore } from '@/store/useDeviceStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function UserTile() {
  const { userColor, userId, userName } = useUserInfoStore(
    useShallow((state) => ({
      userColor: state.userColor,
      userId: state.userId,
      userName: state.userName,
    })),
  );

  const emoji = useParticipantStore((state) => state.emoji.get(userId ?? '') ?? null);
  const { device, stream } = useDeviceStore(
    useShallow((state) => ({
      device: state.deviceEnable,
      stream: state.stream,
    })),
  );

  if (!userId || !userName || !userColor) {
    return null;
  }

  return (
    <BaseTile color={userColor} device={device} emoji={emoji} id={userId} isMe={true} name={userName} stream={stream} />
  );
}
