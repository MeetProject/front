'use client';

import Image from 'next/image';
import { memo, useEffect } from 'react';

import * as webp from '@/asset/webp';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { EmojiDataType } from '@/types/emojiType';

interface EmojiAnimationProps {
  emojiId: string;
  emoji: EmojiDataType;
}

const EMOJI_IMAGE = {
  CLAP: webp.clapEmoji,
  CURIOUS: webp.curiousEmoji,
  HEART: webp.heartEmoji,
  LAUGHTER: webp.laughterEmoji,
  PARTYPOPPER: webp.partyPopperEmoji,
  SAD: webp.sadEmoji,
  SURPRISE: webp.surpriseEmoji,
  THUMBDOWN: webp.thumbDownEmoji,
  THUMBUP: webp.thumbUpEmoji,
};

function EmojiIcon({ emoji, emojiId }: EmojiAnimationProps) {
  const userId = useUserInfoStore((state) => state.userId);
  const participantsUserData = useParticipantStore((state) => state.info);

  useEffect(() => {
    const timerId = setTimeout(() => {
      const { removeEmoji } = useInteractionStore.getState();
      removeEmoji(emojiId);
    }, 4000);

    return () => clearTimeout(timerId);
  }, [emojiId, emoji]);

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
