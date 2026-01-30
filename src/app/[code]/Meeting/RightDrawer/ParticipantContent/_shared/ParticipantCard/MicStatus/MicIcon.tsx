import * as Icon from '@/asset/svg';

interface MicIconProps {
  isMicOn: boolean;
}

export default function MicIcon({ isMicOn }: MicIconProps) {
  if (isMicOn) {
    return <Icon.MicOn className='fill-on-surface-dark size-6' />;
  }

  return <Icon.MicOff className='fill-on-surface-dark size-6' />;
}
