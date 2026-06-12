'use client';

import Image from 'next/image';

import * as image from '@/asset/image';
import { EmojiType } from '@/types/emojiType';

interface EmojiProps {
  emoji: EmojiType | null;
}

const EMOJI = {
  CLAP: image.clapEmoji,
  CURIOUS: image.curiousEmoji,
  HEART: image.heartEmoji,
  LAUGHTER: image.laughterEmoji,
  PARTYPOPPER: image.partyPopperEmoji,
  SAD: image.sadEmoji,
  SURPRISE: image.surpriseEmoji,
  THUMBDOWN: image.thumbDownEmoji,
  THUMBUP: image.thumbUpEmoji,
};

export default function Emoji({ emoji }: EmojiProps) {
  if (!emoji) {
    return;
  }

  return (
    <div className='absolute top-3 left-3 flex size-6.5 items-center justify-center rounded-full bg-[rgba(32,33,36,0.3)]'>
      <Image alt={emoji} height={15} src={EMOJI[emoji]} width={15} />
    </div>
  );
}
