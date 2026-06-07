import { AppData as PrimitiveAppData } from 'mediasoup-client/types';

import { TrackType } from './deviceType';

export type Direction = 'send' | 'recv';
export type AppData = PrimitiveAppData & {
  trackType: TrackType;
  userId: string;
};
