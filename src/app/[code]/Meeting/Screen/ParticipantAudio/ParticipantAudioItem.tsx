'use client';

import { useEffect, useRef } from 'react';

import { Media } from '@/components';
import { useAudioStore } from '@/store/useAudioStore';
import { useLocalMuteStore } from '@/store/useLocalMuteStore';

interface ParticipantAudioItemProps {
  id: string;
}

export default function ParticipantAudioItem({ id }: ParticipantAudioItemProps) {
  const stream = useAudioStore((state) => state.audio.get(id)?.stream ?? null);
  const isMuted = useLocalMuteStore((state) => state.mutedIds.has(id));
  const ref = useRef<HTMLMediaElement>(null);

  useEffect(
    () => () => {
      const element = ref.current;
      element?.pause();
      if (element) {
        element.srcObject = null;
      }
    },
    [],
  );

  return <Media muted={isMuted} ref={ref} stream={stream ?? undefined} tag='audio' />;
}
