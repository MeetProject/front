'use client';

import Image from 'next/image';
import { memo, useMemo } from 'react';

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

  const isMe = emoji.userId === userId;
  const name = isMe ? '나' : participantsUserData.get(emoji.userId)?.userName;

  const leftPercent = useMemo(() => 20 + Math.random() * 60, []);

  return (
    <div
      className='animate-move-bottom-up absolute bottom-0 z-9999 flex -translate-x-1/2 flex-col items-center justify-center gap-2'
      style={{ left: `${leftPercent}%` }}
    >
      <Image alt={emoji.emoji} height={36} src={EMOJI_IMAGE[emoji.emoji]} unoptimized={true} width={36} />
      {name && (
        <div
          className={`max-w-28 truncate rounded-full px-2 text-sm ${isMe ? 'bg-primary-light text-black' : 'bg-surface-base text-white'} `}
        >
          {name}
        </div>
      )}
    </div>
  );
}

const EmojiAnimation = memo(EmojiIcon);

export default EmojiAnimation;
