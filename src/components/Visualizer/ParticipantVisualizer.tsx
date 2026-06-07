import VisualizerContent from './VisualizerContent';

import useParticipantAnalyser from '@/hook/useParticipantAnalyser';

interface ParticipantVisualizerProps {
  source: string;
  className?: string;
  color?: string;
}

export default function ParticipantVisualizer({ className, color, source }: ParticipantVisualizerProps) {
  const analyser = useParticipantAnalyser(source);

  return <VisualizerContent analyser={analyser} className={className} color={color} />;
}
