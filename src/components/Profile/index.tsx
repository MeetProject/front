import ParticipantProfile from './ParticipantProfile';
import ProfileIcon from './ProfileIcon';
import UserProfile from './UserProfile';

interface BaseProps {
  className?: string;
}

interface MyProfileProps extends BaseProps {
  isMe: true;
  id?: string;
  name?: never;
  color?: never;
}

interface ParticipantProps extends BaseProps {
  isMe?: false;
  id: string;
  name?: never;
  color?: never;
}

interface ProfileInfoProps extends BaseProps {
  name: string;
  color: string;
  id?: never;
  isMe?: never;
}

type ProfileProps = MyProfileProps | ParticipantProps | ProfileInfoProps;

export default function Profile({ className, color, id, isMe, name }: ProfileProps) {
  if (name && color) {
    return <ProfileIcon className={className} color={color} name={name} />;
  }
  if (isMe) {
    return <UserProfile className={className} />;
  }

  if (id) {
    return <ParticipantProfile className={className} id={id} />;
  }
  return null;
}
