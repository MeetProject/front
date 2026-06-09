'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Emoji from './Emoji';
import NameTag from './NameTag';
import VideoOffOverlay from './VideoOffOverlay';

import * as Icon from '@/asset/svg';
import { Media, Visualizer } from '@/components';
import { useLocalMuteStore } from '@/store/useLocalMuteStore';
import { DeviceEnableType } from '@/types/deviceType';
import { EmojiType } from '@/types/emojiType';

interface BaseTileProps {
  id: string;
  stream: MediaStream | null;
  device: DeviceEnableType;
  emoji: EmojiType | null;
  isMe?: boolean;
  name: string;
  color: string;
}

export default function BaseTile({ color, device, emoji, id, isMe, name, stream }: BaseTileProps) {
  const timerRef = useRef<NodeJS.Timeout>(null);

  const [isReady, setIsReady] = useState(false);

  const isLocallyMuted = useLocalMuteStore((state) => !isMe && state.mutedIds.has(id));

  useEffect(() => {
    if (device.video) {
      setTimeout(() => setIsReady(true), 200);
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsReady(false);
  }, [device.video]);

  const handlePlaying = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setIsReady(true), 200);
  }, []);

  return (
    <div className='@container-[size] relative flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden p-1'>
      <div className='relative size-full max-h-[calc(100cqw*4/3)] max-w-[calc(100cqh*16/9)]'>
        <div className='size-full max-h-full overflow-hidden'>
          <Media
            className='size-full rounded-xl object-cover'
            muted={isMe}
            stream={stream ?? undefined}
            tag='video'
            onPlaying={handlePlaying}
          />
        </div>

        {(!device.video || !isReady || stream?.getVideoTracks().length === 0) && (
          <div className='absolute inset-0 z-1'>
            <VideoOffOverlay color={color} name={name} />
          </div>
        )}
        <NameTag id={id} name={name} />
        <Emoji emoji={emoji} />
        {isLocallyMuted && (
          <div className='bg-outline-dark absolute top-2.5 left-2.5 flex size-7 items-center justify-center rounded-full opacity-80'>
            <Icon.SoundOff className='fill-surface-info size-4.5' />
          </div>
        )}
        <div className='absolute top-2.5 right-2.5'>
          {device.audio ? (
            <Visualizer source={isMe ? stream : id} />
          ) : (
            <div className='bg-outline-dark flex size-7 items-center justify-center rounded-full opacity-80'>
              <Icon.MicOffFill className='fill-surface-info size-4.5' />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
