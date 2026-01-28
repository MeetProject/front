'use client';

import clsx from 'clsx';

import { useParticipantStore } from '@/store/useParticipantStore';
import { getLuminance } from '@/util/color';

interface ProfileProps {
  id: string;
  className?: string;
}

export default function Profile({ className, id }: ProfileProps) {
  const userInfo = useParticipantStore((state) => state.info.get(id));
  if (!userInfo) {
    return;
  }

  const isLight = getLuminance(userInfo.color) >= 0.8;

  return (
    <div
      className={clsx(
        'flex size-10 items-center justify-center overflow-hidden rounded-full text-center text-xl',
        isLight ? 'text-outline-dark' : 'text-white',
        className,
      )}
      style={{ background: userInfo.color }}
    >
      {userInfo.name.slice(0, 2)}
    </div>
  );
}
