import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';

interface ParticipantTileProps {
  id: string;
}

export default function ParticipantTile({ id }: ParticipantTileProps) {
  const { device, emoji, info, stream } = useParticipantStore(
    useShallow((state) => ({
      device: state.devices.get(id),
      emoji: state.emoji.get(id),
      info: state.info.get(id),
      stream: state.streams.get(id),
    })),
  );

  const isHandsUp = useInteractionStore((state) => state.handsUp.has(id));

  const handleRemoveEmoji = useCallback(() => {
    const { setEmoji } = useParticipantStore.getState();
    setEmoji(id, null);
  }, [id]);

  return (
    <BaseTile
      color={info?.color ?? '#ffffff'}
      emoji={emoji ?? null}
      isHandsUp={isHandsUp}
      name={info?.name ?? ''}
      stream={stream ?? null}
      video={device?.video ?? false}
      onRemoveEmoji={handleRemoveEmoji}
    />
  );
}
