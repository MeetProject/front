'use client';

import { useEffect, useState } from 'react';

import ControlBar from './ControlBar';

import { Loading } from '@/components';

export default function Meeting() {
  const [isPending, setIsPending] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setIsPending(false);
    }, 2000);
  }, []);

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
