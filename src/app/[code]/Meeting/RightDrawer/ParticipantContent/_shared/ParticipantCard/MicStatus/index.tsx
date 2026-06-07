import ParticipantMicStatus from './ParticipantMicStatus';
import UserMicStatus from './UserMicStatus';

interface MicStatusProps {
  id: string;
  isMe?: boolean;
}

export default function MicStatus({ id, isMe }: MicStatusProps) {
  if (isMe) {
    return <UserMicStatus />;
  }

  return <ParticipantMicStatus id={id} />;
}
