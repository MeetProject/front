import { useCallback } from 'react';

import EmojiButton from './EmojiButton';

import * as image from '@/asset/image';
import * as wepb from '@/asset/webp';
import { useEmojiStore } from '@/store/useEmojiStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { EmojiType } from '@/types/emojiType';

const EMOJI_BUTTON = [
  { hoverSrc: wepb.heartEmoji, name: 'HEART', src: image.heartEmoji },
  { hoverSrc: wepb.thumbUpEmoji, name: 'THUMBUP', src: image.thumbUpEmoji },
  { hoverSrc: wepb.partyPoperEmoji, name: 'PARTYPOPPER', src: image.partyPoperEmoji },
  { hoverSrc: wepb.clapEmoji, name: 'CLAP', src: image.clapEmoji },
  { hoverSrc: wepb.laughterEmoji, name: 'LAUGHTER', src: image.laughterEmoji },
  { hoverSrc: wepb.surpriceEmoji, name: 'SURPRISE', src: image.surpriceEmoji },
  { hoverSrc: wepb.sadEmoji, name: 'SAD', src: image.sadEmoji },
  { hoverSrc: wepb.curiousEmoji, name: 'CURIOUS', src: image.curiousEmoji },
  { hoverSrc: wepb.thumbDownEmoji, name: 'THUMBDOWN', src: image.thumbDownEmoji },
];

export default function EmojiDrawer() {
  const handleEmojiButtonClick = useCallback((emoji: EmojiType) => {
    const { addEmoji } = useEmojiStore.getState();
    const { userId } = useUserInfoStore.getState();

    if (!userId) {
      return;
    }

    const timestamp = new Date().toISOString();
    addEmoji({ emoji, timestamp, userId });
  }, []);
  return (
    <div className='flex w-full items-center justify-center px-6'>
      <div className='flex items-center rounded-[36px] bg-[rgb(44,44,44)]'>
        {EMOJI_BUTTON.map((value) => (
          <EmojiButton key={value.name} {...value} onClick={() => handleEmojiButtonClick(value.name as EmojiType)} />
        ))}
      </div>
    </div>
  );
}
