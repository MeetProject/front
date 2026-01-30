'use client';

import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

import { useDeviceStore } from '@/store/useDeviceStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function UserTile() {
  const userId = useUserInfoStore((state) => state.userName);

  const emoji = useParticipantStore((state) => state.userEmoji);
  const { device, stream } = useDeviceStore(
    useShallow((state) => ({
      device: state.deviceEnable,
      stream: state.stream,
    })),
  );

  if (!userId) {
    return null;
  }

  return <BaseTile device={device} emoji={emoji} id={userId ?? ''} isMe={true} stream={stream} />;
}
