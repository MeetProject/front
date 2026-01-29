import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

import { useParticipantStore } from '@/store/useParticipantStore';
import { EmojiType } from '@/types/emojiType';

interface ParticipantTileProps {
  id: string;
}

export default function ParticipantTile({ id }: ParticipantTileProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [currentEmoji, setCurrentEmoji] = useState<null | EmojiType>(null);
  const { device, emoji, info, isHandsUp, stream } = useParticipantStore(
    useShallow((state) => ({
      device: state.devices.get(id),
      emoji: state.emoji.get(id),
      info: state.info.get(id),
      isHandsUp: state.isHandsUp.has(id),
      stream: state.streams.get(id),
    })),
  );

  useEffect(() => {
    if (!emoji) {
      return;
    }

    const { setEmoji } = useParticipantStore.getState();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setCurrentEmoji(emoji);
    setEmoji(id, null);

    timerRef.current = setTimeout(() => {
      setCurrentEmoji(null);
      timerRef.current = null;
    }, 8000);
  }, [emoji, id]);

  return (
    <BaseTile
      color={info?.color ?? '#ffffff'}
      emoji={currentEmoji}
      isHandsUp={isHandsUp ?? false}
      name={info?.name ?? ''}
      stream={stream ?? null}
      video={device?.video ?? false}
    />
  );
}
