'use client';

import clsx from 'clsx';
import { PropsWithChildren, useState } from 'react';

import * as Icon from '@/asset/svg';

interface ParticipantDropDownProps extends PropsWithChildren {
  name: string;
  size: number;
}

export default function ParticipantDropDown({ children, name, size }: ParticipantDropDownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const handleButtonClick = () => {
    setIsOpen((prev) => !prev);
  };
  return (
    <div className='w-full'>
      <button
        className={clsx(
          'border-outline-dark hover:bg-action-hover flex h-10 w-full items-center justify-between rounded-xl border transition-all',
          isOpen && 'rounded-b-none',
        )}
        type='button'
        onClick={handleButtonClick}
      >
        <div className='text-surface-variant mx-4 flex flex-1 items-center justify-between text-sm'>
          <p>{name}</p>
          <p>{size}</p>
        </div>
        <div className='flex size-10 items-center justify-center'>
          <Icon.Chevron
            className={clsx('fill-on-surface size-3 transition-transform duration-300', isOpen && 'rotate-180')}
          />
        </div>
      </button>
      <div
        className={clsx(
          'border-outline-dark grid rounded-b-xl border-x border-b transition-[grid-template-rows] duration-500 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] border-none opacity-0',
        )}
      >
        <div className='h-full min-h-0 overflow-hidden'>{children}</div>
      </div>
    </div>
  );
}
