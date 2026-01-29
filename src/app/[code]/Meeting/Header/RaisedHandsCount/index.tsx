'use client';

import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import RaisedHandsInfo from './RaisedHandsInfo';

import * as Icon from '@/asset/svg';
import { useDrawerStore } from '@/store/useDrawer';
import { useParticipantStore } from '@/store/useParticipantStore';

export default function RaisedHandsCount() {
  const [isHover, setIsHover] = useState<boolean>(false);
  const { info, isHandsUp } = useParticipantStore(
    useShallow((state) => ({
      info: state.info,
      isHandsUp: state.isHandsUp,
    })),
  );

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
        className='bg-success-light flex items-center gap-1 rounded-[48px] p-0.5 pr-3 transition-[width] duration-300'
        onClick={handleDrawerOpenButtonClick}
      >
        <div className='bg-success-deep flex size-8 items-center justify-center rounded-full'>
          <Icon.FrontHand className='fill-success-light size-5' />
        </div>
        <p className='text-success-deep font-google-sans text-xs'>{`${info.get(isHandsUp.values().next().value ?? '')?.name} ${isHandsUp.size > 1 && `외 ${isHandsUp.size}명`}`}</p>
      </button>
      {isHover && <RaisedHandsInfo onClick={handleDrawerOpenButtonClick} />}
    </div>
  );
}
