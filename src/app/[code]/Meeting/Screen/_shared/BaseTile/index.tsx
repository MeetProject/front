'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Emoji from './Emoji';
import NameTag from './NameTag';
import VideoOffOverlay from './VideoOffOverlay';

import { Media } from '@/components';
import { EmojiType } from '@/types/emojiType';

interface BaseTileProps {
  name: string;
  color: string;
  stream: MediaStream | null;
  video: boolean;
  isHandsUp: boolean;
  emoji: EmojiType | null;
  onRemoveEmoji: () => void;
}

export default function BaseTile({ color, emoji, isHandsUp, name, onRemoveEmoji, stream, video }: BaseTileProps) {
  const timerRef = useRef<NodeJS.Timeout>(null);
  const emojiTimerRef = useRef<NodeJS.Timeout>(null);

  const [isReady, setIsReady] = useState(false);
  const [trackStatus, setTrackStatus] = useState({ isEnded: false, isMuted: !video });
  const [currentEmoji, setCurrentEmoji] = useState<EmojiType | null>(emoji);

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
    if (video) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsReady(false);
  }, [video]);

  const handlePlaying = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setIsReady(true), 200);
  }, []);

  useEffect(() => {
    if (!emoji) {
      return;
    }

    const currentTimer = emojiTimerRef.current;

    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    setCurrentEmoji(emoji);

    emojiTimerRef.current = setTimeout(() => {
      onRemoveEmoji();
      emojiTimerRef.current = null;
    }, 8000);

    return () => {
      if (emojiTimerRef.current) {
        clearTimeout(emojiTimerRef.current);
        emojiTimerRef.current = null;
      }
    };
  }, [emoji, onRemoveEmoji]);

  const isVideoOff = useMemo(() => !video || trackStatus.isMuted || trackStatus.isEnded, [video, trackStatus]);

  return (
    <div className='@container-[size] relative flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden p-1'>
      <div className='relative size-full max-h-[calc(100cqw*4/3)] max-w-[calc(100cqh*16/9)]'>
        <div className='size-full max-h-full overflow-hidden'>
          <Media
            className='size-full rounded-xl object-cover'
            muted={true}
            stream={stream ?? undefined}
            tag='video'
            onPlaying={handlePlaying}
          />
        </div>

        {(isVideoOff || !isReady) && (
          <div className='absolute inset-0 z-1'>
            <VideoOffOverlay color={color} name={name} />
          </div>
        )}
        <NameTag isHandsUp={isHandsUp} name={name} />
        <Emoji emoji={currentEmoji} />
      </div>
    </div>
  );
}
