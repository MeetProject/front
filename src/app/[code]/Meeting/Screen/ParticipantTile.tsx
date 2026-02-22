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

  return (
    <BaseTile
      color={info?.userColor ?? ''}
      device={device ?? { audio: true, video: true }}
      emoji={emoji ?? null}
      id={id}
      name={info?.userName ?? ''}
      stream={stream ?? null}
    />
  );
}
