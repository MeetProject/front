'use client';

import EmojiAnimation from './EmojiAnimation';

import { useInteractionStore } from '@/store/useInteractionStore';

export default function EmojiReaction() {
  const emojiMap = useInteractionStore((state) => state.emoji);

  return (
    <div className='absolute top-0 left-0 h-full w-75 overflow-hidden'>
      {}
      {Array.from(emojiMap.entries()).map(([id, emoji]) => (
        <EmojiAnimation emoji={emoji} emojiId={id} key={id} />
      ))}
    </div>
  );
}
