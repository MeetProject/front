'use client';

import { useCallback, useRef, useState } from 'react';

import Media from '../Media';

import * as Icon from '@/asset/svg';
import { cn } from '@/lib/cn';

interface SpeakerTestButtonProps {
  color: 'white' | 'black';
  onPlay: (value: boolean) => void;
}

export default function SpeakerTestButton({ color, onPlay }: SpeakerTestButtonProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleAudioButtonClick = () => {
    if (!audioRef.current || isPlaying) {
      return;
    }
    setIsPlaying(true);
    onPlay(true);
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const handleAudioEnded = useCallback(() => {
    onPlay(false);
    setIsPlaying(false);
  }, [onPlay]);

  return (
    <button
      className={`group ${color === 'white' ? 'border-outline-dark disabled:bg-surface-base hover:bg-[rgba(256,256,256,0.10)]' : 'border-surface-variant hover:bg-[rgba(0,0,0,0.1)] disabled:bg-white'} flex h-11 w-full items-center gap-5 border-t px-4`}
      disabled={isPlaying}
      type='button'
      onClick={handleAudioButtonClick}
    >
      <Icon.Sound
        className={cn(
          color === 'white'
            ? 'fill-on-surface group-disabled:fill-state-disabled'
            : 'fill-outline-dark group-disabled:fill-gray-400',
        )}
        height={20}
        width={20}
      />
      <div>
        <p
          className={`${color === 'white' ? 'text-on-surface group-disabled:text-state-disabled' : 'text-outline-dark group-disabled:text-gray-400'} ext-sm`}
        >
          {isPlaying ? '재생 중' : '스피커 테스트'}
        </p>
      </div>

      <Media hidden={true} ref={audioRef} src='/audio/soundTest.mp3' tag='audio' onEnded={handleAudioEnded} />
    </button>
  );
}
