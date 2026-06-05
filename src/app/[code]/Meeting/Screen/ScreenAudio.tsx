'use client';

import { useEffect, useRef } from 'react';

import { Media } from '@/components';
import { useAudioStore } from '@/store/useAudioStore';

export default function ScreenAudio() {
  const masterStream = useAudioStore((state) => state.audioStream);
  const audioRef = useRef<HTMLMediaElement>(null);

  // Safari 등 자동재생 정책으로 join 시점(user gesture 밖)에 suspended/blocked 된 오디오를
  // 사용자 첫 상호작용 시점에 resume + 재생하여 복구한다.
  useEffect(() => {
    const unlock = () => {
      const { resumeAudioContext } = useAudioStore.getState();
      resumeAudioContext();
      audioRef.current?.play().catch(() => {});
    };

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchend', unlock);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchend', unlock);
    };
  }, []);

  return <Media autoPlay={true} ref={audioRef} stream={masterStream ?? undefined} tag='audio' />;
}
