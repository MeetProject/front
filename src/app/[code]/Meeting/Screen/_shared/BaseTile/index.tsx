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

  const videoTrack = stream?.getVideoTracks()[0] ?? null;
  const prevVideoTrackRef = useRef(videoTrack);

  useEffect(() => {
    const isTrackChanged = prevVideoTrackRef.current !== videoTrack;
    prevVideoTrackRef.current = videoTrack;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!device.video) {
      setIsReady(false);
      return;
    }

    if (isTrackChanged) {
      setIsReady(false);
      return;
    }

    timerRef.current = setTimeout(() => setIsReady(true), 200);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [device.video, videoTrack]);

  const handlePlaying = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setIsReady(true), 200);
  }, []);

  const [isVideoMuted, setIsVideoMuted] = useState(false);

  useEffect(() => {
    if (!videoTrack) {
      setIsVideoMuted(false);
      return;
    }

    const syncMuted = () => {
      setIsVideoMuted(videoTrack.muted);
    };
    syncMuted();

    videoTrack.addEventListener('mute', syncMuted);
    videoTrack.addEventListener('unmute', syncMuted);

    return () => {
      videoTrack.removeEventListener('mute', syncMuted);
      videoTrack.removeEventListener('unmute', syncMuted);
    };
  }, [videoTrack]);

  return (
    <div className='@container-size relative flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden p-1'>
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

        {(!device.video || !isReady || isVideoMuted || !videoTrack) && (
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
            isMe ? (
              <Visualizer />
            ) : (
              <Visualizer source={id} />
            )
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
