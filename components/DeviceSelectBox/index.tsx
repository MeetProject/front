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
}

const ICON_MAP = {
  audioInput: Icon.Mic,
  audioOutput: Icon.Speaker,
  videoInput: Icon.VideoOn,
};

export default function DeviceSelectBox({ type }: DeviceSelectBoxProps) {
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
    setIsClicked((prev) => !prev);
  };

  const disabled = type !== 'audioOutput' && permission[type === 'audioInput' ? 'audio' : 'video'] === 'denied';

  const CurrentIcon = ICON_MAP[type];

  return (
    <div className='@container relative flex w-full' ref={targetRef}>
      <button
        className={`flex h-14 w-full min-w-16 items-center gap-2 truncate rounded border border-solid ${disabled ? 'border-[#E7E8E8]' : 'border-[#80868B]'} pr-6.25 pl-2.5 ${!disabled && 'hover:bg-[#F6FAFE] active:border-[#1B77E4] active:bg-[#DBE9FB]'} `}
        disabled={Boolean(disabled)}
        type='button'
        onClick={handleSelectButtonClick}
      >
        <CurrentIcon fill={disabled ? '#B5B6B7' : '#3C4043'} height={16} width={16} />
        <p className={`w-full truncate text-left ${disabled ? 'text-[#B5B6B7]' : 'text-[#3C4043]'}`}>
          {disabled ? '권한 필요' : (device[type]?.label ?? '시스템 장치')}
        </p>
        <Icon.ChevronFill
          className='absolute top-5 right-3'
          fill={disabled ? '#B5B6B7' : '#3C4043'}
          height={18}
          width={18}
        />
      </button>
      {isClicked && device[type] && (
        <DeviceSelector currentValue={device[type]} type={type} onClose={handleSelectButtonClick} />
      )}
    </div>
  );
}
