'use client';

import { useShallow } from 'zustand/shallow';

import * as Icon from '@/asset/svg';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';

interface DeviceEnableButtonProps {
  type: DeviceKindType;
  onClickDeniedButton: () => void;
}

const ICON = {
  audio: { off: Icon.MicOff, on: Icon.MicOn },
  video: { off: Icon.VideoOff, on: Icon.VideoOn },
};

export default function DeviceEnableButton({ onClickDeniedButton, type }: DeviceEnableButtonProps) {
  const { toggleAudioTrack, toggleVideoTrack } = useDevice();
  const { deviceEnable, permission } = useDeviceStore(
    useShallow((state) => ({
      deviceEnable: state.deviceEnable,
      permission: state.permission,
    })),
  );

  const handleButtonClick = () => {
    if (permission[type] === 'denied') {
      onClickDeniedButton();
      return;
    }

    if (type === 'audio') {
      toggleAudioTrack();
      return;
    }
    toggleVideoTrack();
  };

  const IconComponent = ICON[type][deviceEnable[type] ? 'on' : 'off'];

  return (
    <>
      {permission[type] !== 'prompt' && (
        <div className='relative flex items-center'>
          <button
            className={`relative flex items-center justify-center border border-solid shadow-sm ${!deviceEnable[type] && permission[type] === 'granted' ? 'border-[#EA4335] bg-[#EA4335]' : 'border-white'} size-14 rounded-full [@media(max-width:400px)]:size-10`}
            type='button'
            onClick={handleButtonClick}
          >
            <IconComponent className='[@media(max-width:400px)]:size-5' fill='#ffffff' height={24} width={24} />
          </button>
          {permission[type] === 'denied' && (
            <div className='absolute top-[10%] right-[18%] flex size-4 items-center justify-center rounded-full bg-[rgb(251,188,4)] [@media(max-width:400px)]:size-3'>
              <Icon.Warn className='[@media(max-width:400px)]:size-3' height={16} width={16} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
