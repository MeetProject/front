import { TrackType } from '@/types/deviceType';

export const isScreenTrack = (trackType: TrackType) => trackType === 'screen' || trackType === 'screenAudio';
