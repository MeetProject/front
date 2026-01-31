import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

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

  if (device === undefined || stream === undefined) {
    return null;
  }

  return (
    <BaseTile
      color={info?.color ?? ''}
      device={device}
      emoji={emoji ?? null}
      id={id}
      name={info?.name ?? ''}
      stream={stream ?? null}
    />
  );
}
