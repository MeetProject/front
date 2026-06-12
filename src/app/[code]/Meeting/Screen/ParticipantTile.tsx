import { memo, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

import { useParticipantStore } from '@/store/useParticipantStore';
import { DeviceKindType } from '@/types/deviceType';

interface ParticipantTileProps {
  id: string;
  updateTrackStatus: (userId: string, trackType: DeviceKindType, shouldTrack: boolean) => Promise<void>;
}

function ParticipantTile({ id, updateTrackStatus }: ParticipantTileProps) {
  const { device, emoji, info, stream } = useParticipantStore(
    useShallow((state) => ({
      device: state.devices.get(id),
      emoji: state.emoji.get(id),
      info: state.info.get(id),
      stream: state.videoStreams.get(id),
    })),
  );

  useEffect(() => {
    if (!stream) {
      return;
    }
    updateTrackStatus(id, 'video', true);
  }, [updateTrackStatus, id, stream]);

  useEffect(
    () => () => {
      updateTrackStatus(id, 'video', false);
    },
    [updateTrackStatus, id],
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

export default memo(ParticipantTile);
