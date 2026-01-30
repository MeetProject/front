'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Emoji from './Emoji';
import NameTag from './NameTag';
import VideoOffOverlay from './VideoOffOverlay';

import * as Icon from '@/asset/svg';
import { Media } from '@/components';
import { DeviceEnableType } from '@/types/deviceType';
import { EmojiType } from '@/types/emojiType';

interface BaseTileProps {
  id: string;
  stream: MediaStream | null;
  device: DeviceEnableType;
  emoji: EmojiType | null;
  isMe?: boolean;
}

export default function BaseTile({ device, emoji, id, isMe, stream }: BaseTileProps) {
  const timerRef = useRef<NodeJS.Timeout>(null);

  const [isReady, setIsReady] = useState(false);
  const [trackStatus, setTrackStatus] = useState({ isEnded: false, isMuted: !device.video });

  useEffect(() => {
    const videoTrack = stream?.getVideoTracks()[0];
    if (!videoTrack) {
      setTrackStatus({ isEnded: true, isMuted: true });
      return;
    }

    const updateStatus = () => {
      setTrackStatus({
        isEnded: videoTrack.readyState === 'ended',
        isMuted: !videoTrack.enabled || videoTrack.readyState !== 'live',
      });
    };

    updateStatus();

    videoTrack.addEventListener('mute', updateStatus);
    videoTrack.addEventListener('unmute', updateStatus);
    videoTrack.addEventListener('ended', updateStatus);

    return () => {
      videoTrack.removeEventListener('mute', updateStatus);
      videoTrack.removeEventListener('unmute', updateStatus);
      videoTrack.removeEventListener('ended', updateStatus);
    };
  }, [stream]);

  useEffect(() => {
    if (device.video) {
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

  const isVideoOff = useMemo(
    () => !device.video || trackStatus.isMuted || trackStatus.isEnded,
    [device.video, trackStatus],
  );

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

        {(isVideoOff || !isReady) && (
          <div className='absolute inset-0 z-1'>
            <VideoOffOverlay id={id} isMe={isMe} />
          </div>
        )}
        <NameTag id={id} isMe={isMe} />
        <Emoji emoji={emoji} />
        {!device.audio && (
          <div className='bg-outline-dark absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full opacity-80'>
            <Icon.MicOffFill className='fill-surface-info size-4.5' />
          </div>
        )}
      </div>
    </div>
  );
}
