'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

import * as image from '@/asset/image';
import * as Icon from '@/asset/svg';
import { useAlertStore } from '@/store/useAlertStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useSignalStore } from '@/store/useSignalStore';

interface ChatContentProps {
  sendChat: (message: string) => void;
}

export default function ChatContent({ sendChat }: ChatContentProps) {
  const chatData = useParticipantStore((state) => state.chat);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const hasChat = chatData.length > 0;

  const handleChatSubmit = useCallback(
    (value: string) => {
      const { client } = useSignalStore.getState();
      if (!client?.connected) {
        useAlertStore.getState().addAlert('연결이 끊겨 메시지를 보낼 수 없습니다.');
        throw new Error('STOMP client is not connected');
      }

      isAtBottomRef.current = true;
      sendChat(value);
    },
    [sendChat],
  );

  useEffect(() => {
    const anchor = bottomAnchorRef.current;
    if (!anchor) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      isAtBottomRef.current = entry.isIntersecting;
    });
    observer.observe(anchor);

    return () => observer.disconnect();
  }, [hasChat]);

  useEffect(() => {
    if (!isAtBottomRef.current) {
      return;
    }
    bottomAnchorRef.current?.scrollIntoView({ block: 'end' });
  }, [chatData]);

  return (
    <div className='flex size-full flex-col'>
      <div className='bg-surface-elevated m-3 flex flex-col items-center gap-2 rounded-lg p-3'>
        <div className='flex items-center justify-center gap-1'>
          <Icon.ChatOff className='fill-primary-container' height={16} width={16} />
          <h3 className='text-on-surface font-google-sans text-xs'>연속 채팅 사용 중지됨</h3>
        </div>
        <div className='font-google-sans text-on-surface text-center text-xs'>
          통화가 종료되면 메시지가 저장되지 않습니다. 나중에 참여하는 사용자에게도 표시되도록 메시지를 고정할 수
          있습니다.
        </div>
      </div>
      <div className='flex size-full flex-1 py-2'>
        {chatData.length === 0 ? (
          <div className='flex flex-1 flex-col items-center justify-center'>
            <Image alt='chat' height={208} src={image.chat} width={208} />
            <p className='text-on-surface mt-8 text-sm'>아직 채팅 메시지가 없습니다.</p>
          </div>
        ) : (
          <div className='flex-1'>
            {chatData.map((el) => (
              <ChatMessage chat={el} key={el.messages[0].id} />
            ))}
            <div ref={bottomAnchorRef} />
          </div>
        )}
      </div>
      <ChatInput onSubmit={handleChatSubmit} />
    </div>
  );
}
