'use client';

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
  selectorPositionX?: 'top' | 'bottom';
  selectorPositionY?: 'center' | 'left' | 'right';
  overflow?: boolean;
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
  selectorPositionX = 'bottom',
  selectorPositionY = 'right',
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

  return (
    <div className='@container relative flex size-full' ref={targetRef}>
      <button
        className={`flex h-14 max-h-full w-full min-w-16 items-center gap-2 truncate rounded border border-solid ${disabled ? 'border-[#E7E8E8]' : 'border-[#80868B]'} pr-6.25 pl-2.5 ${!disabled && 'hover:bg-[#F6FAFE] active:border-[#1B77E4] active:bg-[#DBE9FB]'} ${className} `}
        type='button'
        onClick={handleSelectButtonClick}
      >
        <CurrentIcon fill={disabled ? '#B5B6B7' : '#3C4043'} height={16} width={16} />
        <p className={`w-full truncate text-left text-sm ${disabled ? 'text-[#B5B6B7]' : 'text-[#3C4043]'}`}>
          {disabled ? '권한 필요' : (device[type]?.label ?? '시스템 장치')}
        </p>
        <Icon.ChevronFill
          className='absolute top-1/2 right-3 -translate-y-1/2'
          fill={disabled ? '#B5B6B7' : '#3C4043'}
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
          type={type}
          onClose={handleSelectButtonClick}
        />
      )}
    </div>
  );
}
