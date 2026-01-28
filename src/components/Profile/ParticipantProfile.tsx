'use client';

import ProfileIcon from './ProfileIcon';

import { useParticipantStore } from '@/store/useParticipantStore';

interface ProfileIconProps {
  id: string;
  className?: string;
}

export default function ParticipantProfile({ className, id }: ProfileIconProps) {
  const info = useParticipantStore((state) => state.info.get(id));

  if (!info) {
    return null;
  }

  return <ProfileIcon className={className} color={info.color} name={info.name} />;
}
