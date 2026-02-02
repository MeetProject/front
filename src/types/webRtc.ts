import {
  AppData as PrimitiveAppData,
  ConsumerOptions,
  RtpCapabilities,
  TransportOptions,
} from 'mediasoup-client/types';

import { TrackType } from './deviceType';

export type Direction = 'send' | 'recv';
export type AppData = PrimitiveAppData & {
  kind: TrackType;
  userId: string;
};

export interface CapabilitiesResponseType {
  capabilities: RtpCapabilities;
}

export interface TransportParamsResponseType {
  params: TransportOptions<AppData>;
}

export interface ConsumeParamsResponseType {
  params: ConsumerOptions<AppData>;
}

export interface RTLSRegisterResponseType {
  id: string;
}
