'use client';

import { DeviceSelectBox } from '@/components';
import { DeviceType } from '@/types/deviceType';

interface DeviceSelectorProps {
  onOpenDialog: () => void;
}

interface DeviceSelectorItemType {
  type: DeviceType;
  positionX: 'right' | 'center' | 'left';
  volume?: boolean;
}
const DEVICE: DeviceSelectorItemType[] = [
  { positionX: 'left', type: 'audioInput', volume: true },
  { positionX: 'center', type: 'audioOutput', volume: true },
  { positionX: 'right', type: 'videoInput' },
];

export default function DeviceSelector({ onOpenDialog }: DeviceSelectorProps) {
  return (
    <div className='mt-1 mb-2.5 flex flex-wrap items-center justify-center gap-2'>
      {DEVICE.map((device) => (
        <div className='h-7.5 w-42' key={device.type}>
          <DeviceSelectBox
            className='rounded-4xl'
            selectorPositionX={device.positionX}
            selectorPositionY='top'
            type={device.type}
            volume={device.volume}
            onDisabledClick={onOpenDialog}
          />
        </div>
      ))}
    </div>
  );
}
