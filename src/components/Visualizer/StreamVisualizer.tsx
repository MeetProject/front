import VisualizerContent from './VisualizerContent';

import useStreamVolume from '@/hook/useStreamVolume';

interface StreamVisualizerProps {
  stream: MediaStream | null;
  className?: string;
  color?: string;
}

export default function StreamVisualizer({ className, color, stream }: StreamVisualizerProps) {
  const { volume } = useStreamVolume(stream);
  return <VisualizerContent className={className} color={color} volume={volume} />;
}
