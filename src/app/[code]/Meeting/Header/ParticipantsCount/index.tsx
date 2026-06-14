'use client';

import ParticipantInfo from './ParticipantInfo';
import ParticipantTileCluster from './ParticipantTileCluster';

import { useDrawerHover } from '@/hook';
import { useParticipantStore } from '@/store/useParticipantStore';

export default function ParticipantCount() {
  const { handleDrawerOpen, handleHoverOff, handleHoverOn, isHover } = useDrawerHover('participants');

  const participants = useParticipantStore((state) => state.info);
  const count = participants.size + 1;

  return (
    <div className='relative' onMouseEnter={handleHoverOn} onMouseLeave={handleHoverOff}>
      <button
        aria-label={`참여자 ${count}명 보기`}
        className='bg-surface-base hover:bg-state-layer flex h-9 items-center gap-2 rounded-full pr-3 pl-0.5 transition-colors'
        type='button'
        onClick={() => handleDrawerOpen()}
      >
        <ParticipantTileCluster participants={[...participants.keys()]} />
        <span className='text-xs font-bold text-white'>{count}</span>
      </button>

      {isHover && <ParticipantInfo onClick={handleDrawerOpen} />}
    </div>
  );
}
