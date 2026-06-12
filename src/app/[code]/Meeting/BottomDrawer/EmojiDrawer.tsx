import { useCallback } from 'react';

import EmojiButton from './EmojiButton';

import * as image from '@/asset/image';
import * as wepb from '@/asset/webp';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { EmojiType } from '@/types/emojiType';

interface EmojiDrawerProps {
  onEmojiClick: (emoji: EmojiType) => void;
}

const EMOJI_BUTTON = [
  { hoverSrc: wepb.heartEmoji, name: 'HEART', src: image.heartEmoji },
  { hoverSrc: wepb.thumbUpEmoji, name: 'THUMBUP', src: image.thumbUpEmoji },
  { hoverSrc: wepb.partyPopperEmoji, name: 'PARTYPOPPER', src: image.partyPopperEmoji },
  { hoverSrc: wepb.clapEmoji, name: 'CLAP', src: image.clapEmoji },
  { hoverSrc: wepb.laughterEmoji, name: 'LAUGHTER', src: image.laughterEmoji },
  { hoverSrc: wepb.surpriseEmoji, name: 'SURPRISE', src: image.surpriseEmoji },
  { hoverSrc: wepb.sadEmoji, name: 'SAD', src: image.sadEmoji },
  { hoverSrc: wepb.curiousEmoji, name: 'CURIOUS', src: image.curiousEmoji },
  { hoverSrc: wepb.thumbDownEmoji, name: 'THUMBDOWN', src: image.thumbDownEmoji },
];

export default function EmojiDrawer({ onEmojiClick }: EmojiDrawerProps) {
  const handleEmojiButtonClick = useCallback(
    (emoji: EmojiType) => {
      const { userId } = useUserInfoStore.getState();

      if (!userId) {
        return;
      }

      onEmojiClick(emoji);
    },
    [onEmojiClick],
  );
  return (
    <div className='mt-3 flex w-full items-center justify-center px-6'>
      <div className='bg-state-dim flex items-center rounded-[36px]'>
        {EMOJI_BUTTON.map((value) => (
          <EmojiButton key={value.name} {...value} onClick={() => handleEmojiButtonClick(value.name as EmojiType)} />
        ))}
      </div>
    </div>
  );
}
