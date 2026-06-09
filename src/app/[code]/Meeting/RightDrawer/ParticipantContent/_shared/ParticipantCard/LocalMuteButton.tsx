'use client';

import { useParticipantAudioControl } from '../../../../ParticipantAudioControlContext';

import * as Icon from '@/asset/svg';
import { useLocalMuteStore } from '@/store/useLocalMuteStore';

interface LocalMuteButtonProps {
  id: string;
}

export default function LocalMuteButton({ id }: LocalMuteButtonProps) {
  const isMuted = useLocalMuteStore((state) => state.mutedIds.has(id));
  const { toggleMute } = useParticipantAudioControl();

  return (
    <button
      aria-label={isMuted ? '오디오 켜기' : '오디오 끄기'}
      className='hover:bg-action-hover flex size-12 items-center justify-center rounded-full'
      type='button'
      onClick={() => toggleMute(id)}
    >
      {isMuted ? (
        <Icon.SoundOff className='fill-error-dark size-6' />
      ) : (
        <Icon.Sound className='fill-on-surface-dark size-6' />
      )}
    </button>
  );
}
