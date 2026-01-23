'use client';

import clsx from 'clsx';
import { useState, useCallback } from 'react';

import { Button } from './Button';

import * as Icon from '@/asset/svg';
import { useOutsideClick } from '@/hook';
import { RightDrawerKeyType } from '@/types/drawerType';

const BUTTON_TYPES: RightDrawerKeyType[] = ['info', 'chat'];

export default function MeetingAuxControls() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = useCallback(() => setIsOpen(false), []);
  const { targetRef } = useOutsideClick<HTMLDivElement>(handleClose);

  return (
    <div className='relative flex items-center justify-self-end' ref={targetRef}>
      <button
        className='hover:bg-device-button-hover-bg hidden size-12 items-center justify-center rounded-full max-[810px]:flex'
        type='button'
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon.Chevron
          className={clsx('fill-device-button-item transition-all', !isOpen && 'rotate-180')}
          height={12}
          width={12}
        />
      </button>
      <div
        className={clsx(
          'flex items-center gap-2',
          !isOpen && 'max-[810px]:hidden',
          isOpen && [
            'max-[810px]:flex max-[810px]:flex-col',
            'max-[810px]:absolute max-[810px]:top-0 max-[810px]:right-1/2',
            'max-[810px]:translate-x-1/2 max-[810px]:-translate-y-[calc(100%+8px)]',
            'max-[810px]:w-16 max-[810px]:rounded-lg max-[810px]:bg-[rgb(32,33,36)] max-[810px]:p-2 max-[810px]:shadow-xl',
          ],
        )}
      >
        {BUTTON_TYPES.map((type, i) => (
          <Button
            align={i !== BUTTON_TYPES.length - 1 && !isOpen ? 'center' : 'right'}
            key={type}
            type={type}
            onClick={isOpen ? handleClose : undefined}
          />
        ))}
      </div>
    </div>
  );
}
