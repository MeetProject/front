'use client';

import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import ChatContent from './ChatContent';
import Header from './Header';
import InfoContent from './InfoContent';
import ParticipantContent from './ParticipantContent';

import { cn } from '@/lib/cn';
import { useDrawerStore } from '@/store/useDrawer';
import { RightDrawerKeyType } from '@/types/drawerType';

export default function RightDrawer() {
  const { chat, info, participants } = useDrawerStore(
    useShallow((state) => ({
      chat: state.chat,
      info: state.info,
      participants: state.participants,
    })),
  );

  const getOpenStatus = () => {
    if (chat) {
      return 'chat';
    }

    if (info) {
      return 'info';
    }

    if (participants) {
      return 'participants';
    }

    return null;
  };

  const isOpen = getOpenStatus();

  const handleClose = useCallback((type: RightDrawerKeyType) => {
    const { toggleDrawer } = useDrawerStore.getState();
    toggleDrawer(type);
  }, []);

  const name = {
    chat: '회의 중 메시지',
    info: '회의 세부정보',
    participants: '사용자',
  };

  const content = {
    chat: <ChatContent />,
    info: <InfoContent />,
    participants: <ParticipantContent />,
  };

  return (
    <aside
      className={cn(
        'relative z-3 h-full shrink-0 transition-[width,margin] duration-500 ease-in-out',
        isOpen ? 'w-93.5' : 'w-0',
        'max-[600px]:w-0',
      )}
    >
      <div
        className={cn(
          'bg-surface-base absolute top-0 right-0 flex h-full transform flex-col shadow-xl transition-all duration-500 ease-in-out',
          'w-89.5 rounded-[20px]',
          'max-[400px]:w-[calc(100vw-32px)]',
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        )}
      >
        {isOpen && (
          <>
            <Header name={name[isOpen]} onClose={() => handleClose(isOpen)} />
            <main className='m-2 mt-0 flex-1 overflow-y-scroll p-2 pt-0'>{content[isOpen]}</main>
          </>
        )}
      </div>
    </aside>
  );
}
