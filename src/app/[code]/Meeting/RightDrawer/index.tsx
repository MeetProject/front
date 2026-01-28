'use client';

import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import ChatContent from './ChatContent';
import Header from './Header';
import InfoContent from './InfoContent';

import { cn } from '@/lib/cn';
import { useDrawerStore } from '@/store/useDrawer';
import { RightDrawerKeyType } from '@/types/drawerType';

export default function RightDrawer() {
  const { chat, info } = useDrawerStore(
    useShallow((state) => ({
      chat: state.chat,
      info: state.info,
    })),
  );

  const getOpenStatus = () => {
    if (chat) {
      return 'chat';
    }

    if (info) {
      return 'info';
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
  };

  const content = {
    chat: <ChatContent />,
    info: <InfoContent />,
  };

  return (
    <aside
      className={cn(
        'relative h-full transition-[width,margin] duration-500 ease-in-out',
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
            <main className='flex-1 overflow-hidden'>{content[isOpen]}</main>
          </>
        )}
      </div>
    </aside>
  );
}
