export type MessageGroup = 'single' | 'start' | 'middle' | 'end';

export interface ChatResponseType {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
}

export interface GroupChatType {
  userId: string;
  messages: Omit<ChatResponseType, 'userId'>[];
}
