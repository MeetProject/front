'use client';

import { useShallow } from 'zustand/shallow';

import { Visualizer } from '@/components';
import { useDeviceStore } from '@/store/useDeviceStore';

export default function Volume() {
  const { deviceEnable, permission, stream } = useDeviceStore(
    useShallow((state) => ({
      deviceEnable: state.deviceEnable,
      permission: state.permission,
      stream: state.stream,
    })),
  );
  return (
    <>
      {deviceEnable.audio && permission.audio === 'granted' && stream && (
        <div className='absolute bottom-4 left-4 z-3'>
          <Visualizer stream={stream} />
        </div>
      )}
    </>
  );
}
