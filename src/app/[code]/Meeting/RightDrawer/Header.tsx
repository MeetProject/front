'use client';

import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';

interface HeaderProps {
  name: string;
  onClose: () => void;
}

export default function Header({ name, onClose }: HeaderProps) {
  return (
    <header className='flex h-16 w-full items-center justify-between pr-3 pl-6'>
      <p className='text-on-surface-dark font-google-sans text-lg'>{name}</p>
      <ButtonTag name='닫기'>
        <button
          className='hover:bg-action-hover flex size-12 items-center justify-center rounded-full'
          type='button'
          onClick={onClose}
        >
          <Icon.Delete className='fill-outline-dark' height={24} width={24} />
        </button>
      </ButtonTag>
    </header>
  );
}
