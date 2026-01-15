'use client';

import { useCurrentDate } from '@/hook';
import { formatTime, formatDate } from '@/util/formatter';

export default function CurrentDate() {
  const time = useCurrentDate();
  if (!time) {
    return <div />;
  }
  return (
    <div className='flex items-center gap-2 p-3 text-lg font-medium text-gray-500 max-[472px]:hidden'>
      <p>{formatTime(time)}</p>
      <span>•</span>
      <p>{formatDate(time)}</p>
    </div>
  );
}
