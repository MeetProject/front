'use client';

import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

import { useDeviceStore } from '@/store/useDeviceStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function UserTile() {
  const userId = useUserInfoStore((state) => state.userName);

  const emoji = useParticipantStore((state) => state.userEmoji);
  const { stream, video } = useDeviceStore(
    useShallow((state) => ({
      stream: state.stream,
      video: state.deviceEnable.video,
    })),
  );

  return <BaseTile emoji={emoji} id={userId ?? ''} isMe={true} stream={stream} video={video} />;
}
