'use client';

import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import DeviceSelector from './DeviceSelector';
import DeviceVideo from './DeviceVideo';
import ScreenSaver from './ScreenSaver';

import { MediaPermissionDeniedDialog, MediaPermissionDialog } from '@/components';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';
import { queryDevicePermission } from '@/util/env';

export default function Device() {
  const { initStream, stopStream } = useDevice();
  const { isInit, permission, stream } = useDeviceStore(
    useShallow((state) => ({
      isInit: state.isInit,
      permission: state.permission,
      stream: state.stream,
    })),
  );
  const [isDeniedDialogOpen, setIsDeniedDialogOpen] = useState<boolean>(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState<boolean>(false);

  const handleDeniedDialogOpen = useCallback(async () => {
    const [audio, video] = await Promise.all([queryDevicePermission('audio'), queryDevicePermission('video')]);

    // Permissions API 미지원 브라우저: 앱 상태 기준으로 기존처럼 모달을 띄운다.
    if (audio === null && video === null) {
      setIsDeniedDialogOpen(true);
      return;
    }

    // 브라우저 권한이 실제로 denied인 경우에만 차단 모달을 띄운다.
    if (audio === 'denied' || video === 'denied') {
      setIsDeniedDialogOpen(true);
      return;
    }

    // 실제로는 prompt(앱이 잘못 막아둔 false-denied)면 모달 대신 실제 권한 요청을 다시 시도한다.
    await initStream(true);
  }, [initStream]);

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

    const { deviceEnable } = useDeviceStore.getState();

    if (!deviceEnable.audio) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }

    if (!deviceEnable.video) {
      stream.getVideoTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
      });
    }
  }, [stream, isInit]);

  useEffect(() => () => stopStream(), [stopStream]);

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
