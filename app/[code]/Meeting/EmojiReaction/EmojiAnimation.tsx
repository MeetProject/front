'use client';

import Image from 'next/image';
import { memo, useEffect } from 'react';

import * as webp from '@/asset/webp';
import { useEmojiStore } from '@/store/useEmojiStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { EmojiDataType } from '@/types/emojiType';

interface EmojiAnimationProps {
  id: string;
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
  THUMBUP: webp.thumbDownEmoji,
};

function EmojiIcon({ emoji, id }: EmojiAnimationProps) {
  const userId = useUserInfoStore((state) => state.userId);
  const participantsUserData = new Map();
  useEffect(() => {
    setTimeout(() => {
      const { deleteEmoji } = useEmojiStore.getState();
      deleteEmoji(id);
    }, 4000);
  }, [id]);
  return (
    <div
      className='animate-move-bottom-up absolute bottom-0 flex flex-col items-center justify-center gap-2'
      style={{ left: `${Math.random() * 264}px` }}
    >
      <Image alt={emoji.emoji} height={36} src={EMOJI_IMAGE[emoji.emoji]} unoptimized={true} width={36} />
      <div
        className={`max-w-28 truncate rounded-full px-2 text-sm ${emoji.userId === userId ? 'bg-[#8AB4F8] text-[#48525F]' : 'bg-[#202124] text-white'} `}
      >
        {userId === emoji.userId ? '나' : participantsUserData.get(emoji.userId)?.userName}
      </div>
    </div>
  );
}

const EmojiAnimation = memo(EmojiIcon);

export default EmojiAnimation;
