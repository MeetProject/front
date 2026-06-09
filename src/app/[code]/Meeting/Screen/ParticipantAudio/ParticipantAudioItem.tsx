'use client';

import { useEffect, useRef } from 'react';

import { Media } from '@/components';
import { useAudioStore } from '@/store/useAudioStore';

interface ParticipantAudioItemProps {
  id: string;
}

export default function ParticipantAudioItem({ id }: ParticipantAudioItemProps) {
  const stream = useAudioStore((state) => state.audio.get(id)?.stream ?? null);
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

  return <Media ref={ref} stream={stream ?? undefined} tag='audio' />;
}
