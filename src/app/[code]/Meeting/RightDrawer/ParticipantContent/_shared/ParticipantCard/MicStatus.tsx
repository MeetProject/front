'use client';

import * as Icon from '@/asset/svg';
import { useParticipantStore } from '@/store/useParticipantStore';

interface MicStatusProps {
  userId: string;
}

export default function MicStatus({ userId }: MicStatusProps) {
  const isMicOn = useParticipantStore((state) => state.devices.get(userId)?.audio);

  if (isMicOn) {
    return <Icon.MicOn className='fill-on-surface-dark size-6' />;
  }

  return <Icon.MicOff className='fill-on-surface-dark size-6' />;
}
