'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import BottomDrawer from './BottomDrawer';
import ControlBar from './ControlBar';
import EmojiReaction from './EmojiReaction';
import Header from './Header';
import RightDrawer from './RightDrawer';
import Screen from './Screen';

import { Loading } from '@/components';
import { useDevice } from '@/hook';
import useWebrtc from '@/hook/useWebrtc';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useDrawerStore } from '@/store/useDrawer';

export default function Meeting() {
  const roomId = usePathname().slice(1);
  const { initStream } = useDevice();
  const { isInit } = useDeviceStore(
    useShallow((state) => ({
      isInit: state.isInit,
    })),
  );

  const { joinRoom } = useWebrtc();
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    if (!isInit) {
      return;
    }

    const init = async () => {
      await initStream();
      await joinRoom(roomId);
      //peerConnection
      setIsPending(false);
    };

    init();
  }, [isInit, initStream, joinRoom, roomId]);

  useEffect(
    () => () => {
      const { stopScreenStream, stopStream } = useDeviceStore.getState();
      const { reset } = useDrawerStore.getState();
      stopStream();
      stopScreenStream();
      reset();
      /* peerConnection clear */
    },
    [],
  );

  if (isPending) {
    return <Loading isPending={isPending} />;
  }

  return (
    <div className='bg-surface-deep relative flex h-svh w-svw flex-col overflow-hidden select-none'>
      <Header />
      <div className='flex flex-1 flex-col'>
        <div className='relative flex flex-1 flex-col'>
          <div className='relative flex flex-1 shrink overflow-hidden px-4'>
            <div className='flex size-full shrink overflow-hidden rounded-[20px]'>
              <Screen />
            </div>
            <RightDrawer />
          </div>
          <EmojiReaction />
        </div>
        <BottomDrawer />
      </div>
      <ControlBar />
    </div>
  );
}
