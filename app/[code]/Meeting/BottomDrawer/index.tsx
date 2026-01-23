'use client';

import { useShallow } from 'zustand/shallow';

import EmojiDrawer from './EmojiDrawer';

import { useDrawerStore } from '@/store/useDrawer';

export default function BottomDrawer() {
  const { cc, emoji } = useDrawerStore(
    useShallow((state) => ({
      cc: state.cc,
      emoji: state.emoji,
    })),
  );

  return (
    <div className='w-full overflow-hidden transition-all duration-500 ease-in-out'>
      <div
        className={`grid w-full transition-[grid-template-rows,opacity] duration-500 ease-in-out ${cc ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className='overflow-hidden'>
          <div className='h-51 w-full'>cc</div>
        </div>
      </div>
      <div
        className={`grid w-full transition-[grid-template-rows,opacity] duration-500 ease-in-out ${emoji ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className='overflow-hidden'>
          <EmojiDrawer />
        </div>
      </div>
    </div>
  );
}
