import {
  AppData as PrimitiveAppData,
  ConsumerOptions,
  RtpCapabilities,
  TransportOptions,
} from 'mediasoup-client/types';

import { DeviceEnableType, TrackType } from './deviceType';
import { EmojiDataType, EmojiType } from './emojiType';

export type Direction = 'send' | 'recv';
export type AppData = PrimitiveAppData & {
  trackType: TrackType;
  userId: string;
};

export interface DtlsResponseType {
  options: TransportOptions<AppData>;
}

export interface JoinRoomPayloadType {
  mediaOption: DeviceEnableType;
  roomId: string;
}

export interface UserDataType {
  userId: string;
  userName: string;
  profileColor: string;
  roomId: string;
}

export interface ParticipantDataType {
  user: UserDataType;
  isHandUp: boolean;
  mediaOption: DeviceEnableType;
  producerIds: string[];
}

export interface JoinRoomResponseType {
  participants: ParticipantDataType[];
}

export interface ResyncResponseType {
  participants: ParticipantDataType[];
  rejoinRequired: boolean;
}

export interface ParticipantResponseType {
  participant: ParticipantDataType;
}

export interface CapabilitiesResponseType {
  capabilities: RtpCapabilities;
}

export interface ConsumerParamsResponseType {
  consumerParams: ConsumerOptions<AppData>;
}

export interface ToggleDeviceEnableResponseType {
  userId: string;
  mediaOption: DeviceEnableType;
}

export interface TrackResponseType {
  produceId: string[];
  userId: string;
}

export interface ProducerResponseType {
  userId: string;
  producerId: string;
}

export interface ProducerRemoveResponseType {
  userId: string;
  trackType: TrackType;
}

export interface ToggleHandsUpResponseType {
  userId: string;
}

export interface EmojiResponseType extends EmojiDataType {
  id: string;
}

export interface ChatResponseType {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
}

export interface TrackEndResponseType {
  userId: string;
  consumerId: string;
}

export interface LeaveResponseType {
  userId: string;
}

export interface ChatPayloadType {
  message: string;
}

export interface DevicePayloadType {
  mediaOption: DeviceEnableType;
}

export interface EmojiPayloadType {
  emoji: EmojiType;
}

export interface HandUpPayloadType {
  value: boolean;
}

export interface ProducerRemovePayloadType {
  producerId: string;
  trackType: TrackType;
}
