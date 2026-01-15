'use client';

import { PropsWithChildren, useEffect } from 'react';

import { useDeviceStore } from '@/store/useDeviceStore';

export default function DeviceProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const initPermission = async () => {
      try {
        const audio = await navigator.permissions.query({ name: 'microphone' });
        const video = await navigator.permissions.query({ name: 'camera' });
        useDeviceStore.setState({ permission: { audio: audio.state, video: video.state } });

        audio.onchange = () => {
          useDeviceStore.setState((prev) => ({ permission: { ...prev.permission, audio: audio.state } }));
        };

        video.onchange = () => {
          useDeviceStore.setState((prev) => ({ permission: { ...prev.permission, video: video.state } }));
        };
      } catch {}
    };

    initPermission();
  }, []);

  return children;
}
