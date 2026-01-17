'use client';

import { useEffect, useState } from 'react';

import { DeviceSelectBox } from '@/components';
import { DeviceType } from '@/types/deviceType';

interface DeviceSelectorProps {
  onOpenDialog: () => void;
}

interface DeviceSetorType {
  type: DeviceType;
  positionY: 'right' | 'center' | 'left';
}
const DEVICE: DeviceSetorType[] = [
  { positionY: 'left', type: 'audioInput' },
  { positionY: 'center', type: 'audioOutput' },
  { positionY: 'right', type: 'videoInput' },
];

export default function DeviceSelector({ onOpenDialog }: DeviceSelectorProps) {
  const [isCenter, setIsCenter] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsCenter(window.innerWidth < 520);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <div className='mt-1 mb-2.5 flex flex-wrap items-center justify-center gap-2'>
      {DEVICE.map((device) => (
        <div className='h-7.5 w-42' key={device.type}>
          <DeviceSelectBox
            className='rounded-4xl'
            overflow={!isCenter}
            selectorPositionX='top'
            selectorPositionY={device.positionY}
            type={device.type}
            onDisabledClick={onOpenDialog}
          />
        </div>
      ))}
    </div>
  );
}
