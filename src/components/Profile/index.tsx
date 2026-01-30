import ParticipantProfile from './ParticipantProfile';
import UserProfile from './UserProfile';

interface BaseProps {
  className?: string;
}

interface MyProfileProps extends BaseProps {
  isMe: true;
  id?: string;
}

interface ParticipantProps extends BaseProps {
  isMe?: false;
  id: string;
}
type ProfileProps = MyProfileProps | ParticipantProps;

export default function Profile({ className, id, isMe }: ProfileProps) {
  if (isMe) {
    return <UserProfile className={className} />;
  }
  return <ParticipantProfile className={className} id={id} />;
}
