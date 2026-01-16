'use client';

import { PropsWithChildren, useEffect, useRef } from 'react';

import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';

export default function DeviceProvider({ children }: PropsWithChildren) {
  const { initStream } = useDevice();
  const isInitializing = useRef<boolean>(false);

  useEffect(() => {
    const initPermission = async () => {
      try {
        const audio = await navigator.permissions.query({ name: 'microphone' });
        const video = await navigator.permissions.query({ name: 'camera' });

        const syncDevice = async () => {
          if (isInitializing.current) {
            return;
          }

          const { permission: prev } = useDeviceStore.getState();
          if (prev.audio === audio.state && prev.video === video.state) {
            return;
          }

          useDeviceStore.setState({ permission: { audio: audio.state, video: video.state } });

          isInitializing.current = true;
          await initStream({ audio: audio.state === 'granted', video: video.state === 'granted' });
          isInitializing.current = false;
        };

        useDeviceStore.setState({
          permission: { audio: audio.state, video: video.state },
        });

        audio.onchange = syncDevice;
        video.onchange = syncDevice;
      } catch {}
    };

    initPermission();
  }, [initStream]);

  return children;
}
