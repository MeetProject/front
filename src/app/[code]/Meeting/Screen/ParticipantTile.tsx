import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import BaseTile from './_shared/BaseTile';

import { useParticipantStore } from '@/store/useParticipantStore';
import { DeviceKindType } from '@/types/deviceType';

interface ParticipantTileProps {
  id: string;
  updateTrackStatus: (userId: string, trackType: DeviceKindType, shouldTrack: boolean) => Promise<void>;
}

export default function ParticipantTile({ id, updateTrackStatus }: ParticipantTileProps) {
  const { device, emoji, info, stream } = useParticipantStore(
    useShallow((state) => ({
      device: state.devices.get(id),
      emoji: state.emoji.get(id),
      info: state.info.get(id),
      stream: state.streams.get(id),
    })),
  );

  useEffect(() => {
    const handleTrackEnable = async (value: boolean) => {
      if (!stream) {
        return;
      }
      await Promise.all([updateTrackStatus(id, 'audio', value), updateTrackStatus(id, 'video', value)]);
    };

    handleTrackEnable(true);
    return () => {
      handleTrackEnable(false);
    };
  }, [updateTrackStatus, id, stream]);

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
