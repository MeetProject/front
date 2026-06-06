'use client';

import { MouseEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import DeviceVolume from './DeviceVolume';
import SpeakerTestButton from './SpeakerTest';

import * as Icon from '@/asset/svg';
import { useDevice } from '@/hook';
import { cn } from '@/lib/cn';
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
  onTrackChange?: (device: MediaStreamTrack | null) => Promise<void> | void;
}

export default function DeviceSelector({
  currentValue,
  onClose,
  onPlay,
  onTrackChange,
  positionX,
  positionY,
  theme = 'default',
  type,
  volume = false,
}: DeviceSelectorProps) {
  const { replaceTrack } = useDevice();
  const { deviceList } = useDeviceStore(useShallow((state) => ({ deviceList: state.deviceList })));

  const handleDeviceButtonClick = async (e: MouseEvent<HTMLButtonElement>, device: MediaDeviceInfo) => {
    e.stopPropagation();
    if (currentValue.deviceId === device.deviceId) {
      return;
    }
    const newTrack = await replaceTrack(device);
    await onTrackChange?.(newTrack);
    onClose();
  };

  const isDark = theme === 'dark';

  const wrapperCn = cn(
    'animate-slide-in-bottom absolute z-10 max-h-94 w-80 min-w-full origin-top overflow-hidden rounded-2xl py-2 transition-all',
    positionY === 'top' ? 'bottom-full mb-1' : 'top-full mt-1',
    positionX === 'center' ? 'left-1/2 -translate-x-1/2' : positionX === 'left' ? 'left-0' : 'right-0',
    isDark ? 'bg-surface-base shadow-none' : 'bg-white shadow-xl',
  );

  return (
    <div className={wrapperCn}>
      {deviceList[type].map((device) => (
        <button
          className={cn(
            'group relative flex h-11 w-80 items-center px-4 pl-14 transition-colors',
            isDark
              ? device.deviceId === currentValue.deviceId
                ? 'hover:bg-state-hover bg-state-active'
                : 'bg-surface-base hover:bg-surface-elevated'
              : 'bg-white hover:bg-gray-100 active:bg-gray-200',
          )}
          key={device.deviceId}
          type='button'
          onClick={(e) => handleDeviceButtonClick(e, device)}
        >
          <span
            className={cn(
              'truncate text-left text-sm font-medium',
              isDark
                ? device.deviceId === currentValue.deviceId
                  ? 'text-blue-300'
                  : 'text-gray-300'
                : device.deviceId === currentValue.deviceId
                  ? 'text-blue-600'
                  : 'text-overlay-dark',
            )}
          >
            {device.label}
          </span>
          {device.deviceId === currentValue.deviceId && (
            <Icon.Check className={cn('absolute left-4 size-6', isDark ? 'fill-blue-300' : 'fill-blue-600')} />
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
