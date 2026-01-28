import ParticipantProfile from './ParticipantProfile';
import ProfileIcon from './ProfileIcon';

interface PropsWithId {
  id: string;
  name?: never;
  color?: never;
}

interface PropsWithNameAndColor {
  id?: never;
  name: string;
  color: string;
}

interface BaseProps {
  className?: string;
}

type ProfileProps = BaseProps & (PropsWithId | PropsWithNameAndColor);

export default function Profile(props: ProfileProps) {
  const { className, color, id, name } = props;

  if (id) {
    return <ParticipantProfile className={className} id={id} />;
  }

  if (name && color) {
    return <ProfileIcon className={className} color={color} name={name} />;
  }

  return null;
}
