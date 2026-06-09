import ParticipantAudio from './ParticipantAudio';
import ScreenWrapper from './ScreenWrapper';

import { TrackType } from '@/types/deviceType';

interface ScreenProps {
  updateTrackStatus: (userId: string, trackType: TrackType, shouldTrack: boolean) => Promise<void>;
}

export default function Screen({ updateTrackStatus }: ScreenProps) {
  return (
    <>
      <ScreenWrapper updateTrackStatus={updateTrackStatus} />
      <ParticipantAudio />
    </>
  );
}
