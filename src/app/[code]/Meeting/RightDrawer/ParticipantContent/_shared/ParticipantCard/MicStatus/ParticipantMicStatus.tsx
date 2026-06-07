import MicIcon from './MicIcon';

import { useParticipantStore } from '@/store/useParticipantStore';

interface ParticipantMicStatusProps {
  id: string;
}

export default function ParticipantMicStatus({ id }: ParticipantMicStatusProps) {
  const device = useParticipantStore((state) => state.devices.get(id));

  return <MicIcon isMicOn={device?.audio ?? false} />;
}
