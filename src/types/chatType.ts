import { ChatResponseType } from './session';
import { UserRegisterPayloadType } from './userType';

export type MessageGroup = 'single' | 'start' | 'middle' | 'end';

export interface GroupChatType {
  userId: string;
  userInfo?: UserRegisterPayloadType;
  messages: Omit<ChatResponseType, 'userId'>[];
}
