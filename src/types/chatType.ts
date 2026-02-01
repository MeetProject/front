import { ChatResponseType } from './session';

export type MessageGroup = 'single' | 'start' | 'middle' | 'end';

export interface GroupChatType {
  userId: string;
  messages: Omit<ChatResponseType, 'userId'>[];
}
