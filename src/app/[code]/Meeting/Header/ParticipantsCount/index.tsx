'use client';

import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import ParticipantInfo from './ParticipantInfo';
import ParticipantTileCluster from './ParticipantTileCluster';

import { useDrawerStore } from '@/store/useDrawer';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function ParticipantCount() {
  const [isHover, setIsHover] = useState<boolean>(false);

  const { userColor, userName } = useUserInfoStore(
    useShallow((state) => ({
      userColor: state.userColor,
      userName: state.userName,
    })),
  );
  const participants = useParticipantStore((state) => state.info);
  const count = participants.size + 1;

  const handleToggleOn = () => {
    setIsHover(true);
  };

  const handleToggleOff = () => {
    setIsHover(false);
  };

  const handleDrawerOpenButtonClick = useCallback(() => {
    const { toggleDrawer } = useDrawerStore.getState();
    toggleDrawer('participants');
    setIsHover(false);
  }, []);

  return (
    <div className='relative' onMouseEnter={handleToggleOn} onMouseLeave={handleToggleOff}>
      <button
        className='bg-surface-base hover:bg-state-layer flex h-9 items-center gap-2 rounded-full pr-3 pl-0.5 transition-colors'
        onClick={handleDrawerOpenButtonClick}
      >
        <ParticipantTileCluster
          participants={[
            { color: userColor ?? '', name: userName ?? '' },
            ...participants.entries().map(([_, user]) => user),
          ]}
        />
        <span className='text-xs font-bold text-white'>{count}</span>
      </button>

      {isHover && <ParticipantInfo onClick={handleDrawerOpenButtonClick} />}
    </div>
  );
}
