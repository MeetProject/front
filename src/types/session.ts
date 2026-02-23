import { ConsumerOptions, RtpCapabilities, TransportOptions } from 'mediasoup-client/types';

import { DeviceEnableType } from './deviceType';
import { EmojiDataType, EmojiType } from './emojiType';
import { AppData } from './webRtc';

export interface DtlsReponseType {
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

export interface ParticipantResponseType {
  participant: ParticipantDataType;
}

export interface CapabilitiesResponseType {
  capabilities: RtpCapabilities;
}

export interface ConsumerParamsResponseType {
  consumerParams: ConsumerOptions<AppData>;
}

export interface ToggleDeviceEnalbeResponseType {
  userId: string;
  mediaOption: DeviceEnableType;
}

export interface TrackResponseType {
  produceId: string[];
  userId: string;
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

export interface LeaveResponseType {
  userId: string;
}

// interaction
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
