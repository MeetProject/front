'use client';

import clsx from 'clsx';
import { useShallow } from 'zustand/shallow';

import { useUserInfoStore } from '@/store/useUserInfoStore';
import { GroupChatType } from '@/types/chatType';
import { formatTime } from '@/util/formatter';

interface ChatMessageProps {
  chat: GroupChatType;
}

const userData: Record<string, Record<'color' | 'name', string>> = {
  user_02: {
    color: '#ffaa00',
    name: 'user_02',
  },
};

export default function ChatMessage({ chat }: ChatMessageProps) {
  const { id } = useUserInfoStore(
    useShallow((state) => ({
      id: state.userId,
    })),
  );

  const isMe = chat.userId === id;
  const user = userData[chat.userId] || { color: '#ccc', name: 'Unknown' };

  return (
    <div className={clsx('flex gap-2 px-3 py-1', isMe ? 'flex-row-reverse' : 'flex-row')}>
      {!isMe && (
        <div
          className='mt-6 flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] text-white'
          style={{ backgroundColor: user.color }}
        >
          {user.name[0]}
        </div>
      )}

      <div className={clsx('flex max-w-[70%] flex-col gap-1', isMe ? 'items-end' : 'items-start')}>
        <div className='mb-1 flex items-center gap-2 px-1'>
          {!isMe && <span className='text-device-content font-google-sans text-[13px] font-medium'>{user.name}</span>}
          <span className='text-device-content font-google-sans text-xs opacity-70'>
            {formatTime(chat.messages[0].timestamp)}
          </span>
        </div>

        {chat.messages.map(({ id: messageId, message }, i) => (
          <div
            className={clsx(
              'text-device-button-item font-google-sans max-w-61 rounded-[20px] bg-[rgb(0,74,119)] p-3 text-[12px] wrap-break-word hover:bg-[rgb(17,84,130)]',
              isMe && i !== chat.messages.length - 1 && 'rounded-br-sm',
              isMe && i !== 0 && 'rounded-tr-sm',
              !isMe && i !== chat.messages.length - 1 && 'rounded-bl-sm',
              !isMe && i !== 0 && 'rounded-tl-sm',
            )}
            key={messageId}
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}
