import { DeviceEnableType } from './deviceType';

export interface UserRegisterPayloadType {
  name: string;
  color: string;
}

export interface UserRegisterResponseType {
  userId: string;
}

export interface UserDataType {
  id: string;
  name: string;
  color: string;
  deviceEnable: DeviceEnableType;
  stream: MediaStream | null;
}
