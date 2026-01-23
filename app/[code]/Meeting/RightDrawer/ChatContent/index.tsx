'use client';

import Image from 'next/image';
import { useCallback } from 'react';

import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

import * as image from '@/asset/image';
import * as Icon from '@/asset/svg';
import { GroupChatType } from '@/types/chatType';

export default function ChatContent() {
  const chatData: GroupChatType[] = [
    {
      messages: [
        {
          id: 'm1',
          message: '안녕하세요! 오늘 프로젝트 업데이트 사항 공유드립니다.',
          timestamp: '2026-01-22T10:00:00.000Z',
        },
        {
          id: 'm2',
          message: '우선 UI 디자인 시스템 가이드가 확정되었습니다.',
          timestamp: '2026-01-22T10:00:05.000Z',
        },
        {
          id: 'm3',
          message: '첨부파일 확인 부탁드려요.',
          timestamp: '2026-01-22T10:00:12.000Z',
        },
      ],
      userId: 'user_01',
    },
    {
      messages: [
        {
          id: 'm4',
          message: '확인했습니다! 바로 검토해볼게요.',
          timestamp: '2026-01-22T10:01:30.000Z',
        },
      ],
      userId: 'user_02',
    },
    {
      messages: [
        {
          id: 'm5',
          message: '감사합니다. 혹시 추가로 필요한 데이터가 있으면 말씀해주세요.',
          timestamp: '2026-01-22T10:02:45.000Z',
        },
      ],
      userId: 'user_01',
    },
  ];

  const handleChatSubmit = useCallback((value: string) => {
    /* eslint-disable-next-line no-console */
    console.log(value);
  }, []);

  return (
    <div className='flex size-full flex-col'>
      <div className='bg-device-button-bg m-3 flex flex-col items-center gap-2 rounded-lg p-3'>
        <div className='flex items-center justify-center gap-1'>
          <Icon.ChatOff className='fill-device-button-selected-bg' height={16} width={16} />
          <h3 className='text-drawer-text font-google-sans text-xs'>연속 채팅 사용 중지됨</h3>
        </div>
        <div className='font-google-sans text-drawer-text text-center text-xs'>
          통화가 종료되면 메시지가 저장되지 않습니다. 나중에 참여하는 사용자에게도 표시되도록 메시지를 고정할 수
          있습니다.
        </div>
      </div>
      <div className='flex size-full flex-1 py-2'>
        {chatData.length === 0 ? (
          <div className='flex flex-1 flex-col items-center justify-center'>
            <Image alt='chat' height={208} src={image.chat} width={208} />
            <p className='text-drawer-text mt-8 text-sm'>아직 채팅 메시지가 없습니다.</p>
          </div>
        ) : (
          <div className='flex-1'>
            {chatData.map((el) => (
              <ChatMessage chat={el} key={el.userId + el.messages[0].timestamp} />
            ))}
          </div>
        )}
      </div>
      <ChatInput onSubmit={handleChatSubmit} />
    </div>
  );
}
