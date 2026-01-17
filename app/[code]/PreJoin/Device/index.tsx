'use client';

import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import DeviceSelector from './DeviceSelector';
import DeviceVideo from './DeviceVideo';

import { MediaPermissionDeniedDialog } from '@/components';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';

export default function Device() {
  const { initStream, toggleAudioTrack, toggleVideoTrack } = useDevice();
  const { permission, stream } = useDeviceStore(
    useShallow((state) => ({
      permission: state.permission,
      stream: state.stream,
    })),
  );
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

  const handleOpenDialog = useCallback(() => {
    setIsOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsOpenDialog(false);
  }, []);

  useEffect(() => {
    initStream();
    useDeviceStore.setState({ deviceEnable: { audio: true, video: true } });
  }, [initStream]);

  useEffect(() => {
    setIsOpenDialog(false);
  }, [permission]);

  useEffect(() => {
    if (!stream) {
      return;
    }

    const { deviceEnable, toggleDeviceEnalbe } = useDeviceStore.getState();

    if (!deviceEnable.audio) {
      toggleDeviceEnalbe('audio');
      toggleAudioTrack();
    }

    if (!deviceEnable.video) {
      toggleDeviceEnalbe('video');
      toggleVideoTrack();
    }
  }, [stream, toggleAudioTrack, toggleVideoTrack]);

  return (
    <div className='flex w-full max-w-191 flex-col'>
      <div className='relative m-4 mr-2 aspect-video flex-1 overflow-hidden rounded-2xl bg-black'>
        <DeviceVideo onOpenDialog={handleOpenDialog} />
      </div>
      <DeviceSelector onOpenDialog={handleOpenDialog} />
      <MediaPermissionDeniedDialog isOpen={isOpenDialog} onClose={handleCloseDialog} />
    </div>
  );
}
