'use client';

import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import ControlBar from './ControlBar';

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

  if (isPending) {
    return <Loading isPending={isPending} />;
  }

  return (
    <div className='relative flex h-svh w-svw flex-col overflow-hidden bg-[rgb(19,19,20)]'>
      <div className='flex-1' />
      <ControlBar />
    </div>
  );
}
