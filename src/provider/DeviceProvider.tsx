'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { useDevice } from '@/hook';
import { getCurrentDeviceInfo } from '@/lib/device';
import { useAudioStore } from '@/store/useAudioStore';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';

export default function DeviceProvider({ children }: PropsWithChildren) {
  const timerRef = useRef<NodeJS.Timeout>(null);
  const [isSupportedPermission, setIsSupportedPermission] = useState<boolean>(true);

  const { initStream } = useDevice();
  const stream = useDeviceStore((state) => state.stream);

  useEffect(() => {
    const statuses: PermissionStatus[] = [];

    const initPermission = async () => {
      try {
        const audio = await navigator.permissions.query({ name: 'microphone' });
        const video = await navigator.permissions.query({ name: 'camera' });

        const syncDevice = async () => {
          const { permission: prev, status } = useDeviceStore.getState();
          if (status === 'pending' || (prev.audio === audio.state && prev.video === video.state)) {
            return;
          }

          useDeviceStore.setState({ isInit: true, permission: { audio: audio.state, video: video.state } });
        };

        useDeviceStore.setState({
          permission: { audio: audio.state, video: video.state },
        });

        if (!('onchange' in audio) || !('onchange' in video)) {
          throw new Error('permission API 미지원');
        }

        audio.onchange = syncDevice;
        video.onchange = syncDevice;
        statuses.push(audio, video);
      } catch {
        setIsSupportedPermission(false);
      } finally {
        useDeviceStore.setState({
          isInit: true,
        });
      }
    };

    initPermission();

    return () => {
      statuses.forEach((status) => {
        status.onchange = null;
      });
    };
  }, []);

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
  }, [stream]);

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

    const setDeviceEnable = (type: DeviceKindType, value: boolean) => {
      useDeviceStore.setState((state) => ({
        deviceEnable: { ...state.deviceEnable, [type]: value },
      }));
    };

    const handleAudioMute = () => setDeviceEnable('audio', false);
    const handleAudioUnmute = () => setDeviceEnable('audio', true);
    const handleVideoMute = () => setDeviceEnable('video', false);
    const handleVideoUnmute = () => setDeviceEnable('video', true);

    stream.getTracks().forEach((track) => track.addEventListener('ended', handleTrackEnded, { once: true }));

    stream.getAudioTracks().forEach((track) => {
      track.addEventListener('mute', handleAudioMute);
      track.addEventListener('unmute', handleAudioUnmute);
    });

    stream.getVideoTracks().forEach((track) => {
      track.addEventListener('mute', handleVideoMute);
      track.addEventListener('unmute', handleVideoUnmute);
    });

    return () => {
      stream.getTracks().forEach((track) => track.removeEventListener('ended', handleTrackEnded));

      stream.getAudioTracks().forEach((track) => {
        track.removeEventListener('mute', handleAudioMute);
        track.removeEventListener('unmute', handleAudioUnmute);
      });

      stream.getVideoTracks().forEach((track) => {
        track.removeEventListener('mute', handleVideoMute);
        track.removeEventListener('unmute', handleVideoUnmute);
      });
    };
  }, [stream, initStream]);

  useEffect(() => {
    if (isSupportedPermission || !stream) {
      return;
    }

    const checkDevicePermission = () => {
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

    checkDevicePermission();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isSupportedPermission, stream, initStream]);

  useEffect(() => {
    const unlock = () => {
      const { resumeAudioContext } = useAudioStore.getState();
      resumeAudioContext();
    };

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchend', unlock);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchend', unlock);
    };
  }, []);

  return children;
}
