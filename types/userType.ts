export interface UserRegisterPayloadType {
  userName: string;
  userColor: string;
}

export interface UserRegisterResponseType {
  userId: string;
}

export interface UserDataType {
  id: string;
  name: string;
  color: string;
  isMicOn: boolean;
  isVideoOn: boolean;
  stream: MediaStream | null;
}
