'use client';

import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

import { useDeviceStore } from '@/store/useDeviceStore';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function UserTile() {
  const emoji = useInteractionStore((state) => state.emoji);
  const { stream, video } = useDeviceStore(
    useShallow((state) => ({
      stream: state.stream,
      video: state.deviceEnable.video,
    })),
  );

  const { color, name } = useUserInfoStore(
    useShallow((state) => ({
      color: state.userColor,
      name: state.userName,
    })),
  );

  const isHandsUp = useInteractionStore((state) => state.handsUp);

  return (
    <BaseTile
      color={color ?? '#ffffff'}
      emoji={emoji}
      isHandsUp={isHandsUp}
      name={name ?? ''}
      stream={stream}
      video={video}
    />
  );
}
