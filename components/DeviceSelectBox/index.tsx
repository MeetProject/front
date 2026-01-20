'use client';

import clsx from 'clsx';
import React, { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import DeviceSelector from './DeviceSelector';

import * as Icon from '@/asset/svg';
import { useOutsideClick } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceType } from '@/types/deviceType';

interface DeviceSelectBoxProps {
  type: DeviceType;
  onDisabledClick?: () => void;
  className?: string;
  selectorPositionY?: 'top' | 'bottom';
  selectorPositionX?: 'center' | 'left' | 'right';
  overflow?: boolean;
  theme?: 'default' | 'dark';
}

const ICON_MAP = {
  audioInput: Icon.Mic,
  audioOutput: Icon.Speaker,
  videoInput: Icon.VideoOn,
};

export default function DeviceSelectBox({
  className,
  onDisabledClick,
  overflow = false,
  selectorPositionX = 'right',
  selectorPositionY = 'bottom',
  theme = 'default',
  type,
}: DeviceSelectBoxProps) {
  const [isClicked, setIsClicked] = useState(false);
  const { targetRef } = useOutsideClick<HTMLDivElement>(() => {
    setIsClicked(false);
  });

  const { device, permission } = useDeviceStore(
    useShallow((state) => ({
      device: state.device,
      permission: state.permission,
    })),
  );

  const handleSelectButtonClick = () => {
    if (disabled) {
      onDisabledClick?.();
    }
    setIsClicked((prev) => !prev);
  };

  const getDisabled = () => {
    if (!device[type]) {
      return true;
    }

    if (type !== 'audioOutput' && permission[type === 'audioInput' ? 'audio' : 'video'] === 'denied') {
      return true;
    }

    return false;
  };

  const disabled = getDisabled();

  const CurrentIcon = ICON_MAP[type];

  const cn = {
    dark: `${disabled ? '#444647' : '#c4c7c5'}`,
    default: `${disabled ? '#b5b6b7' : '#3c4043'}`,
  };

  const wrapperCn = clsx(
    'flex h-14 max-h-full w-full min-w-16 items-center gap-2 truncate rounded border border-solid pr-6.25 pl-2.5',
    theme === 'dark' && 'border-device-outline',
    !disabled && (theme === 'default' ? 'hover:$bg-[#f6fafe]' : 'hover:bg-device-outline'),
    className,
  );

  return (
    <div className='@container relative flex size-full' ref={targetRef}>
      <button className={wrapperCn} type='button' onClick={handleSelectButtonClick}>
        <CurrentIcon fill={cn[theme]} height={16} width={16} />
        <p className='w-full truncate text-left text-sm' style={{ color: cn[theme] }}>
          {disabled ? '권한 필요' : (device[type]?.label ?? '시스템 장치')}
        </p>
        <Icon.ChevronFill
          className='absolute top-1/2 right-3 -translate-y-1/2'
          fill={cn[theme]}
          height={18}
          width={18}
        />
      </button>
      {isClicked && device[type] && (
        <DeviceSelector
          currentValue={device[type]}
          overflow={overflow}
          positionX={selectorPositionX}
          positionY={selectorPositionY}
          theme={theme}
          type={type}
          onClose={handleSelectButtonClick}
        />
      )}
    </div>
  );
}
