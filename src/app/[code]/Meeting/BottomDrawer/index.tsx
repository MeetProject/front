'use client';

import { useShallow } from 'zustand/shallow';

import EmojiDrawer from './EmojiDrawer';

import { cn } from '@/lib/cn';
import { useDrawerStore } from '@/store/useDrawer';
import { EmojiType } from '@/types/emojiType';

interface BottomDrawerProps {
  sendEmoji: (emoji: EmojiType) => void;
}

export default function BottomDrawer({ sendEmoji }: BottomDrawerProps) {
  const { cc, emoji } = useDrawerStore(
    useShallow((state) => ({
      cc: state.cc,
      emoji: state.emoji,
    })),
  );

  return (
    <aside className='w-full overflow-hidden transition-all duration-500 ease-in-out'>
      <div
        className={cn(
          'grid w-full transition-[grid-template-rows,opacity] duration-500 ease-in-out',
          cc ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className='overflow-hidden'>
          <div className='h-51 w-full'>cc</div>
        </div>
      </div>
      <div
        className={cn(
          'grid w-full transition-[grid-template-rows,opacity] duration-500 ease-in-out',
          emoji ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className='overflow-hidden'>
          <EmojiDrawer onEmojiClick={sendEmoji} />
        </div>
      </div>
    </aside>
  );
}
