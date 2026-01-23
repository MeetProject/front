'use client';

import * as Icon from '@/asset/svg';
import { useVolume } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';

interface DeviceVolumeProps {
  color: 'black' | 'white';
}

export default function DeviceVolume({ color }: DeviceVolumeProps) {
  const stream = useDeviceStore((state) => state.stream);
  const { volume } = useVolume(stream);
  return (
    <div
      className={`${color === 'white' ? 'border-device-outline' : 'border-[#e4e6e4]'} flex w-full items-center gap-2 border-t px-2.5 py-1`}
    >
      <Icon.Mic fill={color === 'white' ? '#c4c7c5' : '#444746'} height={20} width={20} />
      <div className='mx-2 my-4 h-1 flex-1 overflow-hidden rounded-sm bg-[#F1F3F4]'>
        <div className='h-full bg-[#1A73E8]' style={{ width: `${Math.min(volume * 2.2, 100)}%` }} />
      </div>
    </div>
  );
}
