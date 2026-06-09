'use client';

import ParticipantAudioItem from './ParticipantAudioItem';

import { useAudioStore } from '@/store/useAudioStore';

export default function ParticipantAudio() {
  const audio = useAudioStore((state) => state.audio);

  return (
    <>
      {[...audio.keys()].map((id) => (
        <ParticipantAudioItem id={id} key={id} />
      ))}
    </>
  );
}
