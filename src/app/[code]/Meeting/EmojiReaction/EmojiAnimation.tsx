'use client';

import Image from 'next/image';
import { memo } from 'react';

import * as webp from '@/asset/webp';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { EmojiDataType } from '@/types/emojiType';

interface EmojiAnimationProps {
  emoji: EmojiDataType;
}

const EMOJI_IMAGE = {
  CLAP: webp.clapEmoji,
  CURIOUS: webp.curiousEmoji,
  HEART: webp.heartEmoji,
  LAUGHTER: webp.laughterEmoji,
  PARTYPOPPER: webp.partyPoperEmoji,
  SAD: webp.sadEmoji,
  SURPRISE: webp.surpriceEmoji,
  THUMBDOWN: webp.thumbDownEmoji,
  THUMBUP: webp.thumbUpEmoji,
};

function EmojiIcon({ emoji }: EmojiAnimationProps) {
  const userId = useUserInfoStore((state) => state.userId);
  const participantsUserData = useParticipantStore((state) => state.info);

  return (
    <div
      className='animate-move-bottom-up absolute bottom-0 z-9999 flex flex-col items-center justify-center gap-2'
      style={{ left: `${Math.random() * 264}px` }}
    >
      <Image alt={emoji.emoji} height={36} src={EMOJI_IMAGE[emoji.emoji]} unoptimized={true} width={36} />
      <div
        className={`max-w-28 truncate rounded-full px-2 text-sm ${emoji.userId === userId ? 'bg-primary-light text-black' : 'bg-surface-base text-white'} `}
      >
        {userId === emoji.userId ? '나' : participantsUserData.get(emoji.userId)?.userName}
      </div>
    </div>
  );
}

const EmojiAnimation = memo(EmojiIcon);

export default EmojiAnimation;
