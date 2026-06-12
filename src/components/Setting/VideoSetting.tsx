import { useShallow } from 'zustand/shallow';

import { DeviceSelectBox, Media } from '@/components';
import { useDeviceStore } from '@/store/useDeviceStore';

interface VideoSettingProps {
  onDisabledClick: () => void;
}

export default function VideoSetting({ onDisabledClick }: VideoSettingProps) {
  const { deviceEnable, permission, stream } = useDeviceStore(
    useShallow((state) => ({
      deviceEnable: state.deviceEnable,
      permission: state.permission,
      stream: state.stream,
    })),
  );

  const canPreview = permission.video === 'granted' && stream && deviceEnable.video;

  return (
    <div className='flex flex-1 flex-col gap-6'>
      <div className='flex items-center gap-4 sm:block'>
        <div className='min-w-25' style={{ flex: '1 1 100px' }}>
          <div>
            <p className='text-success-main mb-2 text-sm font-medium'>카메라</p>
          </div>
          <div className='flex flex-1 items-center gap-4 max-[640px]:flex-col-reverse'>
            <DeviceSelectBox type='videoInput' onDisabledClick={onDisabledClick} />
            <div className='flex w-fit justify-center overflow-hidden rounded-md bg-gray-700'>
              {canPreview ? (
                <Media
                  autoPlay={true}
                  className='aspect-video w-40 object-cover max-[640px]:w-full sm:rounded-md'
                  mirror={true}
                  muted={true}
                  stream={stream}
                  tag='video'
                />
              ) : (
                <div className='flex aspect-video w-40 items-center justify-center max-[640px]:w-full'>
                  <p className='text-xs text-white'>카메라 꺼짐</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
