import MicIcon from './MicIcon';

import { useDeviceStore } from '@/store/useDeviceStore';

export default function UserMicStatus() {
  const device = useDeviceStore((state) => state.deviceEnable);

  return <MicIcon isMicOn={device.audio} />;
}
