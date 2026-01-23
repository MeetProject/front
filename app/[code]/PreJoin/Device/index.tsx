'use client';

import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import DeviceSelector from './DeviceSelector';
import DeviceVideo from './DeviceVideo';
import ScreenSaver from './ScreenSaver';

import { MediaPermissionDeniedDialog, MediaPermissionDialog } from '@/components';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';

export default function Device() {
  const { initStream, toggleAudioTrack, toggleVideoTrack } = useDevice();
  const { isInit, permission, stream } = useDeviceStore(
    useShallow((state) => ({
      isInit: state.isInit,
      permission: state.permission,
      stream: state.stream,
    })),
  );
  const [isDeniedDialogOpen, setIsDeniedDialogOpen] = useState<boolean>(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState<boolean>(false);

  const handleDeniedDialogOpen = useCallback(() => {
    setIsDeniedDialogOpen(true);
  }, []);

  const handleDeniedDialogClose = useCallback(() => {
    setIsDeniedDialogOpen(false);
  }, []);

  const handleRequestDialogClose = useCallback(() => {
    setIsRequestDialogOpen(false);
    useDeviceStore.setState({ deviceEnable: { audio: true, video: true } });
  }, []);

  useEffect(() => {
    if (!isInit) {
      return;
    }

    const getStream = async () => {
      const { permission: currentPermission } = useDeviceStore.getState();
      if (currentPermission.audio === 'prompt' || currentPermission.video === 'prompt') {
        setIsRequestDialogOpen(true);
        return;
      }

      if (currentPermission.audio === 'denied' && currentPermission.video === 'denied') {
        setIsDeniedDialogOpen(true);
        return;
      }

      await initStream(true);
    };

    getStream();
  }, [initStream, isInit]);

  useEffect(() => {
    setIsDeniedDialogOpen(false);
  }, [permission]);

  useEffect(() => {
    if (!stream || !isInit) {
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
  }, [stream, toggleAudioTrack, toggleVideoTrack, isInit]);

  useEffect(
    () => () => {
      const { stopStream } = useDeviceStore.getState();
      stopStream();
    },
    [],
  );

  return (
    <div className='flex w-full max-w-191 flex-col'>
      <div className='relative m-4 mr-2 aspect-video flex-1 overflow-hidden rounded-2xl bg-black'>
        <DeviceVideo onOpenDialog={handleDeniedDialogOpen} />
        <ScreenSaver onClickButton={handleDeniedDialogOpen} />
      </div>
      <DeviceSelector onOpenDialog={handleDeniedDialogOpen} />
      <MediaPermissionDialog isOpen={isRequestDialogOpen} onClose={handleRequestDialogClose} />
      <MediaPermissionDeniedDialog isOpen={isDeniedDialogOpen} onClose={handleDeniedDialogClose} />
    </div>
  );
}
