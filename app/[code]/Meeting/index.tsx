'use client';

import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import BottomDrawer from './BottomDrawer';
import ControlBar from './ControlBar';
import EmojiReaction from './EmojiReaction';

import { Loading } from '@/components';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';

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
      setIsPending(false);
    };

    init();
  }, [isInit, initStream]);

  useEffect(
    () => () => {
      const { stopScreenStream, stopStream } = useDeviceStore.getState();
      stopStream();
      stopScreenStream();
      /* peerConnection clear */
    },
    [],
  );

  if (isPending) {
    return <Loading isPending={isPending} />;
  }

  return (
    <div className='relative flex h-svh w-svw flex-col overflow-hidden bg-[rgb(19,19,20)]'>
      <div className='flex size-full flex-1 flex-col'>
        <div className='relative flex-1 bg-white'>
          <p>screen</p>
          <EmojiReaction />
        </div>
        <BottomDrawer />
      </div>
      <ControlBar />
    </div>
  );
}
