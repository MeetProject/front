import MicIcon from './MicIcon';

import { useDeviceStore } from '@/store/useDeviceStore';

export default function UserMicStatus() {
  const device = useDeviceStore((state) => state.deviceEnable);
  console.log(device);

  return <MicIcon isMicOn={device.audio} />;
}
