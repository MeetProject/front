'use client';

import { useShallow } from 'zustand/shallow';

import * as Icon from '@/asset/svg';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';

interface VideoButtonProps {
  onClickDeniedButton: () => void;
}

export default function VideoButton({ onClickDeniedButton }: VideoButtonProps) {
  const { toggleVideoTrack } = useDevice();
  const { deviceEnable, permission } = useDeviceStore(
    useShallow((state) => ({
      deviceEnable: state.deviceEnable,
      permission: state.permission,
    })),
  );

  const handleButtonClick = () => {
    if (permission.audio === 'denied') {
      onClickDeniedButton();
      return;
    }
    toggleVideoTrack();
  };
  return (
    <>
      {permission.video !== 'prompt' && (
        <div className='relative flex items-center'>
          <button
            className={`relative flex items-center justify-center border border-solid shadow-sm ${!deviceEnable.video && permission.video === 'granted' ? 'border-[#EA4335] bg-[#EA4335]' : 'border-white'} size-14 rounded-full`}
            type='button'
            onClick={handleButtonClick}
          >
            {deviceEnable.video ? (
              <Icon.VideoOn fill='#ffffff' height={24} width={24} />
            ) : (
              <Icon.VideoOff fill='#ffffff' height={24} width={24} />
            )}
          </button>
          {permission.video === 'denied' && (
            <div className='absolute top-1.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-[rgb(251,188,4)]'>
              <Icon.Warn height={16} width={16} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
