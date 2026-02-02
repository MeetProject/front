import { DeviceEnableType, DeviceKindType } from './deviceType';
import { EmojiDataType } from './emojiType';
import { UserDataType } from './userType';

export interface JoinRoomPayloadType {
  userName: string;
  userColor: string;
  produceId: string[];
  deviceEnable: DeviceEnableType;
  roomId: string;
}

export interface ParticipantDataType extends Omit<UserDataType, 'stream'> {
  produceId: string[];
}

export interface JoinRoomResponseType {
  participantData: ParticipantDataType[];
}

export interface ToggleDeviceEnalbeResponseType {
  userId: string;
  deviceType: DeviceKindType;
}

export interface TrackResponseType {
  userId: string;
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
