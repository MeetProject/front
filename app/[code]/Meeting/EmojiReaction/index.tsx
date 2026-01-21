import EmojiAnimation from './EmojiAnimation';

import { useEmojiStore } from '@/store/useEmojiStore';

export default function EmojiReaction() {
  const emojiMap = useEmojiStore((state) => state.emoji);

  return (
    <div className='absolute top-0 left-0 h-full w-75 overflow-hidden'>
      {emojiMap.entries().map(([id, emoji]) => (
        <EmojiAnimation emoji={emoji} id={id} key={id} />
      ))}
    </div>
  );
}
