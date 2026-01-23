import { useShallow } from 'zustand/shallow';

import { DeviceSelectBox, Media } from '@/components';
import { useDeviceStore } from '@/store/useDeviceStore';

interface VideoSettingProps {
  onDisabledClick: () => void;
}

export default function VideoSetting({ onDisabledClick }: VideoSettingProps) {
  const { permission, stream } = useDeviceStore(
    useShallow((state) => ({
      permission: state.permission,
      stream: state.stream,
    })),
  );

  return (
    <div className='flex flex-1 flex-col gap-6'>
      <div className='flex items-center gap-4 sm:block'>
        <div className='min-w-25' style={{ flex: '1 1 100px' }}>
          <div>
            <p className='mb-2 text-sm font-medium text-[#1A73E8]'>카메라</p>
          </div>
          <div className='flex flex-1 items-center gap-4 max-[640px]:flex-col-reverse'>
            <DeviceSelectBox type='videoInput' onDisabledClick={onDisabledClick} />
            <div className='flex w-fit justify-center overflow-hidden rounded-md bg-gray-700'>
              {permission?.video === 'granted' && stream && (
                <Media
                  autoPlay={true}
                  className='aspect-video w-40 object-cover max-[640px]:w-full sm:rounded-md'
                  muted={true}
                  stream={stream}
                  style={{ transform: 'rotateY(180deg)' }}
                  tag='video'
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
