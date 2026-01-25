'use client';

import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import BottomDrawer from './BottomDrawer';
import ControlBar from './ControlBar';
import EmojiReaction from './EmojiReaction';
import RightDrawer from './RightDrawer';
import Screen from './Screen';

import { Loading } from '@/components';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useDrawerStore } from '@/store/useDrawer';

export default function Meeting() {
  const { initStream } = useDevice();
  const { isInit } = useDeviceStore(
    useShallow((state) => ({
      isInit: state.isInit,
    })),
  );
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    if (!isInit) {
      return;
    }

    const init = async () => {
      await initStream();
      //peerConnection
      setIsPending(false);
    };

    init();
  }, [isInit, initStream]);

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
    <div className='relative flex h-svh w-svw flex-col overflow-hidden bg-[rgb(19,19,20)] select-none'>
      <div className='flex size-full flex-1 flex-col'>
        <div className='relative flex flex-1 flex-col'>
          <div className='relative flex flex-1 shrink overflow-hidden p-4'>
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
