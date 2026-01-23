'use client';

import { useCallback, useRef, useState } from 'react';

import Media from '../Media';

import * as Icon from '@/asset/svg';

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
      className={`group ${color === 'white' ? 'border-device-outline disabled:bg-device-bg hover:bg-[rgba(256,256,256,0.10)]' : 'border-[#e4e6e4] hover:bg-[rgba(0,0,0,0.1)] disabled:bg-white'} flex h-11 w-full items-center gap-5 border-t px-4`}
      disabled={isPlaying}
      type='button'
      onClick={handleAudioButtonClick}
    >
      <Icon.Sound
        className={`${color === 'white' ? 'group-disabled:fill-device-disable' : 'group-disabled:fill-gray-400'}`}
        fill={color === 'white' ? '#c4c7c5' : '#444746'}
        height={20}
        width={20}
      />
      <div>
        <p
          className={`${color === 'white' ? 'text-device-content group-disabled:text-device-disable' : 'text-device-outline group-disabled:text-gray-400'} ext-sm`}
        >
          {isPlaying ? '재생 중' : '스피커 테스트'}
        </p>
      </div>

      <Media hidden={true} ref={audioRef} src='/audio/soundTest.mp3' tag='audio' onEnded={handleAudioEnded} />
    </button>
  );
}
