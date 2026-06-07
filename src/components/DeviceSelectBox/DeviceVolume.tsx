'use client';

import { useRef } from 'react';

import * as Icon from '@/asset/svg';
import useStreamAnalyser from '@/hook/useStreamAnalyser';
import useVolumeMeter from '@/hook/useVolumeMeter';
import { useDeviceStore } from '@/store/useDeviceStore';
import { mapBarWidth } from '@/util/volume';

interface DeviceVolumeProps {
  color: 'black' | 'white';
}

export default function DeviceVolume({ color }: DeviceVolumeProps) {
  const stream = useDeviceStore((state) => state.stream);
  const analyser = useStreamAnalyser(stream);

  const barRef = useRef<HTMLDivElement>(null);
  useVolumeMeter(analyser, barRef, mapBarWidth);

  return (
    <div
      className={`${color === 'white' ? 'border-outline-dark' : 'border-surface-variant'} flex w-full items-center gap-2 border-t px-2.5 py-1`}
    >
      <Icon.Mic className={color === 'white' ? 'fill-on-surface' : 'fill-outline-dark'} height={20} width={20} />
      <div className='bg-surface-variant mx-2 my-4 h-1 flex-1 overflow-hidden rounded-sm'>
        <div className='bg-primary-main h-full' ref={barRef} style={{ width: 'calc(var(--meter, 0) * 1%)' }} />
      </div>
    </div>
  );
}
