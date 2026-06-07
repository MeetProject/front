'use client';

import { MouseEvent } from 'react';

import * as Icon from '@/asset/svg';
import { cn } from '@/lib/cn';
import { DeviceType } from '@/types/deviceType';

interface DeviceOptionProps {
  device: MediaDeviceInfo;
  type: DeviceType;
  isSelected: boolean;
  isDark: boolean;
  onSelect: (e: MouseEvent<HTMLButtonElement>, device: MediaDeviceInfo) => void;
}

export default function DeviceOption({ device, isDark, isSelected, onSelect, type }: DeviceOptionProps) {
  const isSystemDefault = type === 'audioOutput' && device.deviceId === 'default';

  return (
    <button
      className={cn(
        'group relative flex min-h-11 w-full items-center px-4 py-2 pl-14 text-left transition-colors',
        isDark
          ? isSelected
            ? 'hover:bg-state-hover bg-state-active'
            : 'bg-surface-base hover:bg-surface-elevated'
          : isSelected
            ? 'bg-gray-100 hover:bg-gray-100'
            : 'bg-white hover:bg-gray-100 active:bg-gray-200',
      )}
      type='button'
      onClick={(e) => onSelect(e, device)}
    >
      <div className='flex min-w-0 flex-col'>
        <span
          className={cn(
            'truncate text-sm font-medium',
            isDark
              ? isSelected
                ? 'text-blue-300'
                : 'text-gray-300'
              : isSelected
                ? 'text-blue-600'
                : 'text-overlay-dark',
          )}
        >
          {device.label}
        </span>
        {isSystemDefault && (
          <span className={cn('truncate text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>시스템 기본값</span>
        )}
      </div>
      {isSelected && (
        <Icon.Check
          className={cn('absolute top-1/2 left-4 size-6 -translate-y-1/2', isDark ? 'fill-blue-300' : 'fill-blue-600')}
        />
      )}
    </button>
  );
}
