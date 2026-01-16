'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { useDevice } from '@/hook';
import { getCurrentDeviceInfo } from '@/lib/device';
import { useDeviceStore } from '@/store/useDeviceStore';

export default function DeviceProvider({ children }: PropsWithChildren) {
  const timerRef = useRef<NodeJS.Timeout>(null);
  const [isSuppertedPermission, setIsSupportedPermission] = useState<boolean>(true);

  const { initStream } = useDevice();
  const stream = useDeviceStore((state) => state.stream);

  useEffect(() => {
    const initPermission = async () => {
      try {
        const audio = await navigator.permissions.query({ name: 'microphone' });
        const video = await navigator.permissions.query({ name: 'camera' });

        const syncDevice = async () => {
          const { permission: prev, status } = useDeviceStore.getState();
          if (status === 'pending' || (prev.audio === audio.state && prev.video === video.state)) {
            return;
          }

          useDeviceStore.setState({ permission: { audio: audio.state, video: video.state } });
          await initStream({ audio: audio.state === 'granted', video: video.state === 'granted' });
        };

        useDeviceStore.setState({
          permission: { audio: audio.state, video: video.state },
        });

        audio.onchange = syncDevice;
        video.onchange = syncDevice;
      } catch {
        setIsSupportedPermission(false);
      }
    };

    initPermission();
  }, [initStream]);

  useEffect(() => {
    const handleDeviceChange = async () => {
      if (!stream) {
        return;
      }
      const deviceInfo = await getCurrentDeviceInfo(stream);
      useDeviceStore.setState({
        device: deviceInfo.device,
        deviceList: deviceInfo.deviceList,
      });
    };
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [initStream, stream]);

  useEffect(() => {
    if (!stream) {
      return;
    }

    const handleTrackEnded = () => {
      const { status } = useDeviceStore.getState();
      if (status === 'pending') {
        return;
      }
      stream.getTracks().forEach((track) => track.removeEventListener('ended', handleTrackEnded));
      initStream();
    };

    stream.getTracks().forEach((track) => track.addEventListener('ended', handleTrackEnded, { once: true }));

    return () => {
      stream.getTracks().forEach((track) => track.removeEventListener('ended', handleTrackEnded));
    };
  }, [stream, initStream]);

  useEffect(() => {
    if (isSuppertedPermission || !stream) {
      return;
    }

    const checkDevicePermssion = async () => {
      timerRef.current = setInterval(async () => {
        const { status, stopStream } = useDeviceStore.getState();
        if (status === 'pending' && timerRef.current) {
          clearInterval(timerRef.current);
          return;
        }
        const tracks = stream.getTracks();
        const isDeny = tracks.some((track) => track.muted || track.readyState === 'ended');

        if (isDeny) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          stopStream();
          await initStream();
        }
      }, 2000);
    };

    checkDevicePermssion();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isSuppertedPermission, stream, initStream]);

  return children;
}
