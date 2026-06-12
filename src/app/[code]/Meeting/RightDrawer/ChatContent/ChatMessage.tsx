'use client';

import { useShallow } from 'zustand/shallow';

import { cn } from '@/lib/cn';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { GroupChatType } from '@/types/chatType';
import { formatTime } from '@/util/text';

interface ChatMessageProps {
  chat: GroupChatType;
}

export default function ChatMessage({ chat }: ChatMessageProps) {
  const user = useParticipantStore((state) => state.info.get(chat.userId)) ??
    chat.userInfo ?? {
      userColor: '#ccc',
      userName: 'Unknown',
    };
  const { id } = useUserInfoStore(
    useShallow((state) => ({
      id: state.userId,
    })),
  );

  const isMe = chat.userId === id;

  return (
    <div className={cn('flex gap-2 px-3 py-1', isMe ? 'flex-row-reverse' : 'flex-row')}>
      {!isMe && (
        <div
          className='mt-6 flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] text-white'
          style={{ backgroundColor: user.userColor }}
        >
          {user.userName[0] ?? '?'}
        </div>
      )}

      <div className={cn('flex max-w-[70%] flex-col gap-1', isMe ? 'items-end' : 'items-start')}>
        <div className='mb-1 flex items-center gap-2 px-1'>
          {!isMe && <span className='text-on-surface font-google-sans text-[13px] font-medium'>{user.userName}</span>}
          <span className='text-on-surface font-google-sans text-xs opacity-70'>
            {formatTime(chat.messages[0].timestamp)}
          </span>
        </div>

        {chat.messages.map(({ id: messageId, message }, i) => (
          <div
            className={cn(
              'text-on-surface-bright font-google-sans bg-primary-dark hover:bg-primary-navy-hover max-w-61 rounded-[20px] p-3 text-[12px] wrap-break-word',
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
