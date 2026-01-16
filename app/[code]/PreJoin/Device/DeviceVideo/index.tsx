import ScreenSaver from './ScreenSaver';

import { Media } from '@/components';
import { useDeviceStore } from '@/store/useDeviceStore';

interface DeviceVideoProps {
  onOpenDialog: () => void;
}

export default function DeviceVideo({ onOpenDialog }: DeviceVideoProps) {
  const stream = useDeviceStore((state) => state.stream);

  if (!stream) {
    return null;
  }
  return (
    <>
      <div
        className='absolute top-0 z-1 h-20 w-full'
        style={{
          backgroundImage: 'linear-gradient(to bottom,rgba(0,0,0,0.7) 0,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0) 100%)',
        }}
      />
      <Media className='size-full object-cover' stream={stream} tag='video' />
      <div
        className='absolute bottom-0 z-1 h-20 w-full'
        style={{ backgroundImage: 'linear-gradient(to top,rgba(0,0,0,0.7) 0,rgba(0,0,0,0.3) 50%,rgba(0,0,0,0) 100%)' }}
      />
      <ScreenSaver onClickButton={onOpenDialog} />
    </>
  );
}
