'use client';

import { MouseEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import DeviceOption from './DeviceOption';
import DeviceVolume from './DeviceVolume';
import SpeakerTestButton from './SpeakerTest';

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
        <DeviceOption
          device={device}
          isDark={isDark}
          isSelected={device.deviceId === currentValue.deviceId}
          key={device.deviceId}
          type={type}
          onSelect={handleDeviceButtonClick}
        />
      ))}
      {volume && type === 'audioInput' && <DeviceVolume color={theme === 'dark' ? 'white' : 'black'} />}
      {volume && type === 'audioOutput' && (
        <SpeakerTestButton color={theme === 'dark' ? 'white' : 'black'} onPlay={onPlay} />
      )}
    </div>
  );
}
