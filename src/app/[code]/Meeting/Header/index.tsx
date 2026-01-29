'use client';

import ParticipantCount from './ParticipantsCount';
import RaisedHandsCount from './RaisedHandsCount';

import { useParticipantStore } from '@/store/useParticipantStore';

export default function Header() {
  const isHandsUp = useParticipantStore((state) => state.isHandsUp);
  return (
    <header className='flex h-16 w-full justify-end px-4 py-3.5'>
      <div className='flex items-center gap-2 px-1'>
        {isHandsUp.size > 0 && <RaisedHandsCount />}
        <ParticipantCount />
      </div>
    </header>
  );
}
