import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

import { useParticipantStore } from '@/store/useParticipantStore';

interface ParticipantTileProps {
  id: string;
}

export default function ParticipantTile({ id }: ParticipantTileProps) {
  const { device, info, isHandsUp, stream } = useParticipantStore(
    useShallow((state) => ({
      device: state.devices.get(id),
      info: state.info.get(id),
      isHandsUp: state.isHandsUp.get(id),
      stream: state.streams.get(id),
    })),
  );
  return (
    <BaseTile
      color={info?.color ?? '#ffffff'}
      isHandsUp={isHandsUp ?? false}
      name={info?.name ?? ''}
      stream={stream ?? null}
      video={device?.video ?? false}
    />
  );
}
