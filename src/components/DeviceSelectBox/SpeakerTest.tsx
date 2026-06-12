'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Media from '../Media';

import * as Icon from '@/asset/svg';
import { cn } from '@/lib/cn';
import { useDeviceStore } from '@/store/useDeviceStore';

interface SpeakerTestButtonProps {
  color: 'white' | 'black';
  onPlay: (value: boolean) => void;
}

export default function SpeakerTestButton({ color, onPlay }: SpeakerTestButtonProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioOutputId = useDeviceStore((state) => state.device.audioOutput?.deviceId);
  const isFirstRef = useRef(true);

  const handleAudioButtonClick = async () => {
    if (!audioRef.current || isPlaying) {
      return;
    }

    const el = audioRef.current;
    const { audioOutput } = useDeviceStore.getState().device;

    if (audioOutput?.deviceId && 'setSinkId' in el) {
      try {
        await el.setSinkId(audioOutput.deviceId);
      } catch {}
    }

    setIsPlaying(true);
    onPlay(true);
    el.currentTime = 0;
    el.play().catch(() => {});
  };

  const handleAudioEnded = useCallback(() => {
    onPlay(false);
    setIsPlaying(false);
  }, [onPlay]);

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }

    audioRef.current?.pause();
    setIsPlaying(false);
    onPlay(false);
  }, [audioOutputId, onPlay]);

  return (
    <button
      className={cn(
        'group mt-1 flex h-11 w-full items-center gap-3 border-t px-4 transition-colors',
        color === 'white'
          ? 'border-outline-dark disabled:bg-surface-base hover:bg-[rgba(255,255,255,0.10)]'
          : 'border-surface-variant hover:bg-[rgba(0,0,0,0.06)] disabled:bg-white',
      )}
      disabled={isPlaying}
      type='button'
      onClick={handleAudioButtonClick}
    >
      <Icon.Sound
        className={cn(
          'shrink-0',
          color === 'white'
            ? 'fill-on-surface group-disabled:fill-state-disabled'
            : 'fill-outline-dark group-disabled:fill-gray-400',
        )}
        height={18}
        width={18}
      />
      <span
        className={cn(
          'truncate text-sm font-medium',
          color === 'white'
            ? 'text-on-surface group-disabled:text-state-disabled'
            : 'text-outline-dark group-disabled:text-gray-400',
        )}
      >
        {isPlaying ? '재생 중' : '스피커 테스트'}
      </span>

      <Media hidden={true} ref={audioRef} src='/audio/soundTest.mp3' tag='audio' onEnded={handleAudioEnded} />
    </button>
  );
}
