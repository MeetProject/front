'use client';

import { useCurrentDate } from '@/hook';
import { formatTime, formatDate } from '@/util/formatter';

export default function CurrentDate() {
  const time = useCurrentDate();
  if (!time) {
    return <div />;
  }
  return (
    <div className='text-outline-dark flex items-center gap-2 p-3 text-lg font-medium max-[472px]:hidden'>
      <p>{formatTime(time)}</p>
      <span>•</span>
      <p>{formatDate(time)}</p>
    </div>
  );
}
