'use client';

import * as Icon from '@/asset/svg';
import useStreamVolume from '@/hook/useStreamVolume';
import { useDeviceStore } from '@/store/useDeviceStore';

interface DeviceVolumeProps {
  color: 'black' | 'white';
}

export default function DeviceVolume({ color }: DeviceVolumeProps) {
  const stream = useDeviceStore((state) => state.stream);
  const { volume } = useStreamVolume(stream);
  return (
    <div
      className={`${color === 'white' ? 'border-outline-dark' : 'border-surface-variant'} flex w-full items-center gap-2 border-t px-2.5 py-1`}
    >
      <Icon.Mic className={color === 'white' ? 'fill-on-surface' : 'fill-outline-dark'} height={20} width={20} />
      <div className='bg-surface-variant mx-2 my-4 h-1 flex-1 overflow-hidden rounded-sm'>
        <div className='bg-primary-main h-full' style={{ width: `${Math.min(volume * 2.2, 100)}%` }} />
      </div>
    </div>
  );
}
