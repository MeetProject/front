import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import EmojiButton from './EmojiButton';

import * as image from '@/asset/image';
import * as wepb from '@/asset/webp';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
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
    const { addEmoji } = useInteractionStore.getState();
    const { addEmoji: setEmoji } = useParticipantStore.getState();
    const { userId } = useUserInfoStore.getState();

    if (!userId) {
      return;
    }

    const id = uuidv4();
    addEmoji(id, { emoji, userId });
    setEmoji(userId, emoji, true);
  }, []);
  return (
    <div className='flex w-full items-center justify-center px-6'>
      <div className='bg-state-hover-dim flex items-center rounded-[36px]'>
        {EMOJI_BUTTON.map((value) => (
          <EmojiButton key={value.name} {...value} onClick={() => handleEmojiButtonClick(value.name as EmojiType)} />
        ))}
      </div>
    </div>
  );
}
