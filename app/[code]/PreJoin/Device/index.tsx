'use client';

import { useCallback, useEffect, useState } from 'react';

import DeviceVideo from './DeviceVideo';

import { MediaPermissionDeniedDialog } from '@/components';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';

export default function Device() {
  const { initStream } = useDevice();
  const permission = useDeviceStore((state) => state.permission);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

  const handleOpenDialog = useCallback(() => {
    setIsOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsOpenDialog(false);
  }, []);

  useEffect(() => {
    initStream();
  }, [initStream]);

  useEffect(() => {
    setIsOpenDialog(false);
  }, [permission]);

  return (
    <div className='flex w-full max-w-191 flex-col'>
      <div className='relative m-4 mr-2 aspect-video flex-1 overflow-hidden rounded-2xl bg-black'>
        <DeviceVideo onOpenDialog={handleOpenDialog} />
      </div>
      <div className='mb-2.5 h-10 border' />
      <MediaPermissionDeniedDialog isOpen={isOpenDialog} onClose={handleCloseDialog} />
    </div>
  );
}
