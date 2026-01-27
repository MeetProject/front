'use client';

import { useEffect, useRef, useState } from 'react';

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
}

export default function BaseTile({ color, emoji, isHandsUp, name, stream, video }: BaseTileProps) {
  const timerRef = useRef<NodeJS.Timeout>(null);
  const [isReady, setIsReady] = useState(false);

  const [isMuted, setIsMuted] = useState(video);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (!stream) {
      return;
    }

    const videoTrack = (stream?.getVideoTracks() ?? [])[0];
    if (!videoTrack) {
      setIsEnded(true);
      return;
    }

    setIsMuted(!videoTrack.enabled || videoTrack.readyState !== 'live');
    setIsEnded(videoTrack.readyState === 'ended');

    const handleMute = () => {
      setIsReady(false);
      setIsMuted(true);
    };
    const handleUnmute = () => setIsMuted(false);
    const handleEnded = () => {
      setIsReady(false);
      setIsEnded(true);
    };

    videoTrack.addEventListener('mute', handleMute);
    videoTrack.addEventListener('unmute', handleUnmute);
    videoTrack.addEventListener('ended', handleEnded);

    return () => {
      videoTrack.removeEventListener('mute', handleMute);
      videoTrack.removeEventListener('unmute', handleUnmute);
      videoTrack.removeEventListener('ended', handleEnded);
    };
  }, [stream]);

  useEffect(() => {
    if (!video) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setIsReady(false);
    }
  }, [video]);

  const handlePlaying = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsReady(true);
    }, 200);
  };

  const isVideoOff = !video || isMuted || isEnded;

  return (
    <div className='@container-[size] relative flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden p-1'>
      <div className='size-full max-h-full overflow-hidden'>
        <Media
          className='size-full object-cover'
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
      <Emoji emoji={emoji} />
    </div>
  );
}
