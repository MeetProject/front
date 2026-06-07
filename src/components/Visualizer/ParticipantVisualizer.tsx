import VisualizerContent from './VisualizerContent';

import useParticipantVolume from '@/hook/useParticipantVolume';

interface ParticipantVisualizerProps {
  source: string;
  className?: string;
  color?: string;
}

export default function ParticipantVisualizer({ className, color, source }: ParticipantVisualizerProps) {
  const { volume } = useParticipantVolume(source);

  return <VisualizerContent className={className} color={color} volume={volume} />;
}
