'use client';

import * as Icon from '@/asset/svg';
import { useVolumeMeter } from '@/hook';
import { cn } from '@/lib/cn';
import { useDeviceStore } from '@/store/useDeviceStore';
import { mapBarWidth } from '@/util/audio';

interface DeviceVolumeProps {
  color: 'black' | 'white';
}

export default function DeviceVolume({ color }: DeviceVolumeProps) {
  const analyser = useDeviceStore((state) => state.localAnalyser);

  const barRef = useVolumeMeter<HTMLDivElement>(analyser, mapBarWidth);

  return (
    <div
      className={cn(
        'flex w-full items-center gap-2 border-t px-2.5 py-1',
        color === 'white' ? 'border-outline-dark' : 'border-surface-variant',
      )}
    >
      <Icon.Mic className={color === 'white' ? 'fill-on-surface' : 'fill-outline-dark'} height={20} width={20} />
      <div className='bg-surface-variant mx-2 my-4 h-1 flex-1 overflow-hidden rounded-sm'>
        <div className='bg-primary-main h-full' ref={barRef} style={{ width: 'calc(var(--meter, 0) * 1%)' }} />
      </div>
    </div>
  );
}
