import VisualizerContent from './VisualizerContent';

import { useStreamAnalyser } from '@/hook';

interface StreamVisualizerProps {
  stream: MediaStream | null;
  className?: string;
  color?: string;
}

export default function StreamVisualizer({ className, color, stream }: StreamVisualizerProps) {
  const analyser = useStreamAnalyser(stream);
  return <VisualizerContent analyser={analyser} className={className} color={color} />;
}
