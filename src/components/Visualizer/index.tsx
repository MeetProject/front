'use client';

import ParticipantVisualizer from './ParticipantVisualizer';
import StreamVisualizer from './StreamVisualizer';

interface VisualizerProperties {
  className?: string;
  color?: string;
  source: string | MediaStream | null;
}

export default function Visualizer({ className, color, source }: VisualizerProperties) {
  if (typeof source === 'string') {
    return <ParticipantVisualizer className={className} color={color} source={source} />;
  }
  return <StreamVisualizer className={className} color={color} />;
}
