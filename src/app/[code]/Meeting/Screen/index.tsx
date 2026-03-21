'use client';

import { useShallow } from 'zustand/shallow';

import StagedLayout from './StagedLayout';
import TiledLayout from './TiledLayout';

import { useParticipantStore } from '@/store/useParticipantStore';
import { TrackType } from '@/types/deviceType';

interface ScreenProps {
  updateTrackStatus: (userId: string, trackType: TrackType, shouldTrack: boolean) => Promise<void>;
}

export default function Screen({ updateTrackStatus }: ScreenProps) {
  const { screenStream } = useParticipantStore(
    useShallow((state) => ({
      info: state.info,
      screenStream: state.screenStream,
    })),
  );

  if (screenStream && screenStream.stream) {
    return <StagedLayout updateTrackStatus={updateTrackStatus} />;
  }
  return <TiledLayout updateTrackStatus={updateTrackStatus} />;
}
