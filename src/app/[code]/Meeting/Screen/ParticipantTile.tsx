import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

import { useParticipantStore } from '@/store/useParticipantStore';

interface ParticipantTileProps {
  id: string;
}

export default function ParticipantTile({ id }: ParticipantTileProps) {
  const { device, emoji, info, isHandsUp, stream } = useParticipantStore(
    useShallow((state) => ({
      device: state.devices.get(id),
      emoji: state.emoji.get(id),
      info: state.info.get(id),
      isHandsUp: state.isHandsUp.has(id),
      stream: state.streams.get(id),
    })),
  );

  const handleRemoveEmoji = useCallback(() => {
    const { setEmoji } = useParticipantStore.getState();
    setEmoji(id, null);
  }, [id]);

  return (
    <BaseTile
      color={info?.color ?? '#ffffff'}
      emoji={emoji ?? null}
      isHandsUp={isHandsUp ?? false}
      name={info?.name ?? ''}
      stream={stream ?? null}
      video={device?.video ?? false}
      onRemoveEmoji={handleRemoveEmoji}
    />
  );
}
