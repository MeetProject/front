'use client';

import VisualizerContent from './VisualizerContent';

import { useAudioStore } from '@/store/useAudioStore';

interface ParticipantVisualizerProps {
  source: string;
  className?: string;
  color?: string;
}

export default function ParticipantVisualizer({ className, color, source }: ParticipantVisualizerProps) {
  const analyser = useAudioStore((state) => state.audio.get(source)?.analyser ?? null);

  return <VisualizerContent analyser={analyser} className={className} color={color} />;
}
