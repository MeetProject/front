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
    <div className='flex items-center gap-3 justify-self-start px-3'>
      <p className='font-google-sans text-white'>{formattedTime}</p>
      <div className='h-4 border-l border-white' />
      <p className='font-google-sans text-white'>{roomId}</p>
    </div>
  );
}
