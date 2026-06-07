'use client';

import { usePathname } from 'next/navigation';

import { useCurrentDate } from '@/hook';

export default function MeetingInfo() {
  const roomId = usePathname().slice(1);
  const time = useCurrentDate();

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
    minute: '2-digit',
  });

  return (
    <div className='flex w-full max-w-50 items-center gap-3 justify-self-start overflow-hidden px-3 max-[640px]:max-w-none max-[540px]:hidden'>
      <p className='font-google-sans shrink-0 text-white'>{formattedTime}</p>
      <div className='h-4 border-l border-white' />
      <p className='font-google-sans truncate text-white select-text'>{roomId}</p>
    </div>
  );
}
