import { GroupChatType } from '@/types/chatType';
import { ChatResponseType } from '@/types/session';

export const groupMessages = (messages: ChatResponseType[]): GroupChatType[] =>
  messages.reduce<GroupChatType[]>((groups, { userId, ...rest }) => {
    const last = groups[groups.length - 1];

    if (last && last.userId === userId) {
      last.messages.push(rest);
      return groups;
    }

    groups.push({ messages: [rest], userId });
    return groups;
  }, []);
