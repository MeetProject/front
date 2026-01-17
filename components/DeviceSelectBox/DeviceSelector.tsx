import { MouseEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import * as Icon from '@/asset/svg';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceType } from '@/types/deviceType';

interface DeviceSelectorProps {
  currentValue: MediaDeviceInfo;
  type: DeviceType;
  onClose: () => void;
  positionX: 'top' | 'bottom';
  positionY: 'left' | 'right' | 'center';
  overflow: boolean;
}

export default function DeviceSelector({
  currentValue,
  onClose,
  overflow,
  positionX,
  positionY,
  type,
}: DeviceSelectorProps) {
  const { replaceTrack } = useDevice();
  const { deviceList } = useDeviceStore(
    useShallow((state) => ({
      deviceList: state.deviceList,
    })),
  );

  const handleDeviceButtonClick = (e: MouseEvent<HTMLButtonElement>, device: MediaDeviceInfo) => {
    e.stopPropagation();
    if (currentValue.deviceId === device.deviceId) {
      return;
    }
    replaceTrack(device);
    onClose();
  };

  const positionCn = {
    bottom: 'top-full',
    center: 'left-1/2 -translate-x-1/2',
    left: 'left-0',
    right: 'right-0',
    top: 'top-0 -translate-y-full',
  };

  return (
    <div
      className={`max-h-[376.2px absolute z-10 ${!overflow && 'w-full'} ${positionCn[positionX]} ${positionCn[positionY]} rounded bg-white py-1.5`}
      style={{
        boxShadow: '0 3px 5px -1px rgba(0,0,0,.2),0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12)',
      }}
    >
      {deviceList[type].map((device) => (
        <button
          className='relative h-11 w-full truncate bg-white pr-4 pl-14 hover:bg-[#F5F5F5] active:bg-[#D7D7D7]'
          key={device.deviceId}
          type='button'
          onClick={(e) => handleDeviceButtonClick(e, device)}
        >
          <p
            className={`w-full truncate text-sm ${device.deviceId === currentValue?.deviceId ? 'text-[#1A73E8]' : 'text-black'} text-left`}
          >
            {device.label}
          </p>
          {device.deviceId === currentValue?.deviceId && (
            <Icon.Check className='absolute top-2.5 left-4' fill='#1A73E8' height={24} width={24} />
          )}
        </button>
      ))}
    </div>
  );
}
