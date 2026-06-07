'use client';

import { useCallback, useState } from 'react';

import ParticipantInfo from './ParticipantInfo';
import ParticipantTileCluster from './ParticipantTileCluster';

import { useDrawerStore } from '@/store/useDrawer';
import { useParticipantStore } from '@/store/useParticipantStore';

export default function ParticipantCount() {
  const [isHover, setIsHover] = useState<boolean>(false);

  const participants = useParticipantStore((state) => state.info);
  const count = participants.size + 1;

  const handleToggleOn = () => {
    setIsHover(true);
  };

  const handleToggleOff = () => {
    setIsHover(false);
  };

  const handleDrawerOpenButtonClick = useCallback((value?: boolean) => {
    const { toggleDrawer } = useDrawerStore.getState();
    toggleDrawer('participants', value);
    setIsHover(false);
  }, []);

  return (
    <div className='relative' onMouseEnter={handleToggleOn} onMouseLeave={handleToggleOff}>
      <button
        className='bg-surface-base hover:bg-state-layer flex h-9 items-center gap-2 rounded-full pr-3 pl-0.5 transition-colors'
        onClick={() => handleDrawerOpenButtonClick()}
      >
        <ParticipantTileCluster participants={[...participants.keys()]} />
        <span className='text-xs font-bold text-white'>{count}</span>
      </button>

      {isHover && <ParticipantInfo onClick={handleDrawerOpenButtonClick} />}
    </div>
  );
}
