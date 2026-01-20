'use client';

import clsx from 'clsx';
import { MouseEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import DeviceVolume from './DeviceVolume';
import SpeakerTestButton from './SpeakerTest';

import * as Icon from '@/asset/svg';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceType } from '@/types/deviceType';

interface DeviceSelectorProps {
  currentValue: MediaDeviceInfo;
  type: DeviceType;
  onClose: () => void;
  positionY: 'top' | 'bottom';
  positionX: 'left' | 'right' | 'center';
  overflow: boolean;
  theme?: 'default' | 'dark';
  volume?: boolean;
  onPlay: (value: boolean) => void;
}

export default function DeviceSelector({
  currentValue,
  onClose,
  onPlay,
  overflow,
  positionX,
  positionY,
  theme = 'default',
  type,
  volume = false,
}: DeviceSelectorProps) {
  const { replaceTrack } = useDevice();
  const { deviceList } = useDeviceStore(useShallow((state) => ({ deviceList: state.deviceList })));

  const handleDeviceButtonClick = (e: MouseEvent<HTMLButtonElement>, device: MediaDeviceInfo) => {
    e.stopPropagation();
    if (currentValue.deviceId === device.deviceId) {
      return;
    }
    replaceTrack(device);
    onClose();
  };

  const isDark = theme === 'dark';

  const wrapperCn = clsx(
    'animate-slide-in-bottom absolute z-10 max-h-94 origin-top overflow-hidden rounded rounded-2xl py-1.5 py-2 transition-all',
    !overflow && 'w-full',
    positionY === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
    positionX === 'center' ? 'left-1/2 -translate-x-1/2' : positionX === 'left' ? 'left-0' : 'right-0',
    isDark ? 'bg-device-bg shadow-none' : 'bg-white shadow-xl',
  );

  return (
    <div className={wrapperCn}>
      {deviceList[type].map((device) => (
        <button
          className={clsx(
            'group relative flex h-11 w-full items-center px-4 pl-14 transition-colors',
            isDark
              ? device.deviceId === currentValue.deviceId
                ? 'hover:bg-device-hover bg-device-active'
                : 'bg-device-bg hover:bg-device-item'
              : 'bg-white hover:bg-gray-100 active:bg-gray-200',
          )}
          key={device.deviceId}
          type='button'
          onClick={(e) => handleDeviceButtonClick(e, device)}
        >
          <span
            className={clsx(
              'truncate text-left text-sm font-medium',
              isDark
                ? device.deviceId === currentValue.deviceId
                  ? 'text-blue-300'
                  : 'text-gray-300'
                : device.deviceId === currentValue.deviceId
                  ? 'text-blue-600'
                  : 'text-black-87',
            )}
          >
            {device.label}
          </span>
          {device.deviceId === currentValue.deviceId && (
            <Icon.Check className={clsx('absolute left-4 size-6', isDark ? 'fill-blue-300' : 'fill-blue-600')} />
          )}
        </button>
      ))}
      {volume && type === 'audioInput' && <DeviceVolume color={theme === 'dark' ? 'white' : 'black'} />}
      {volume && type === 'audioOutput' && (
        <SpeakerTestButton color={theme === 'dark' ? 'white' : 'black'} onPlay={onPlay} />
      )}
    </div>
  );
}
