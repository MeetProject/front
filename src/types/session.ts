import { AppData, TransportOptions } from 'mediasoup-client/types';

import { DeviceEnableType, DeviceKindType } from './deviceType';
import { EmojiDataType } from './emojiType';

export interface DtlsReponseType {
  options: TransportOptions<AppData>;
}

export interface JoinRoomPayloadType {
  userName: string;
  userColor: string;
  produceId: string[];
  deviceEnable: DeviceEnableType;
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
  producerId: string[];
}

export interface JoinRoomResponseType {
  participants: ParticipantDataType[];
}

export interface ToggleDeviceEnalbeResponseType {
  userId: string;
  deviceType: DeviceKindType;
}

export interface TrackResponseType {
  produceId: string[];
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
