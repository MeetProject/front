'use client';

import { useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import Header from './Header';
import InfoContent from './InfoContent';

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
    chat: <InfoContent />,
    info: <InfoContent />,
  };

  return (
    <aside
      className={`relative h-full overflow-hidden transition-[width] duration-500 ease-in-out ${isOpen ? 'w-93.5' : 'w-0'} `}
    >
      <div
        className={`absolute top-0 right-0 h-full w-89.5 transform rounded-[20px] bg-[rgb(32,33,36)] transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} `}
      >
        {isOpen && (
          <>
            <Header name={name[isOpen]} onClose={() => handleClose(isOpen)} />
            <main className='px-6'>{content[isOpen]}</main>
          </>
        )}
      </div>
    </aside>
  );
}
