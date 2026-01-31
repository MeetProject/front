'use client';

import { useCallback, useMemo, useState } from 'react';

import RaisedHandsInfo from './RaisedHandsInfo';

import * as Icon from '@/asset/svg';
import { useDrawerStore } from '@/store/useDrawer';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function RaisedHandsCount() {
  const [isHover, setIsHover] = useState<boolean>(false);
  const info = useParticipantStore((state) => state.info);
  const handsUp = useInteractionStore((state) => state.handsUp);

  console.log(info.get('Alpha'), handsUp);

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

  const displayedText = useMemo(() => {
    const { userId, userName } = useUserInfoStore.getState();
    if (handsUp.size === 0) {
      return '';
    }

    const suffix = handsUp.size > 1 ? `외 ${handsUp.size - 1}명` : '';

    const id = handsUp.values().next().value;
    if (userId === id) {
      return userName + suffix;
    }

    return (info.get(id ?? '')?.name ?? '알 수 없는 사용자') + suffix;
  }, [info, handsUp]);

  return (
    <div className='relative' onMouseEnter={handleToggleOn} onMouseLeave={handleToggleOff}>
      <button
        className='bg-success-light animate-expand-handup-count flex items-center gap-1 overflow-hidden rounded-[48px] p-0.5 pr-3 transition-all [interpolate-size:allow-keywords]'
        onClick={() => handleDrawerOpenButtonClick()}
      >
        <div className='bg-success-deep flex size-8 shrink-0 items-center justify-center rounded-full'>
          <Icon.FrontHand className='fill-success-light size-5' />
        </div>
        <div className='text-success-deep font-google-sans px-1 text-xs whitespace-nowrap'>{displayedText}</div>
      </button>
      {isHover && <RaisedHandsInfo onClick={handleDrawerOpenButtonClick} />}
    </div>
  );
}
