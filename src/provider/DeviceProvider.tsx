'use client';

import { PropsWithChildren, useEffect } from 'react';

import { useDevice, useLocalAnalyser } from '@/hook';
import { resumeAudioContext } from '@/lib/audioGraph';
import { getCurrentDeviceInfo } from '@/lib/device';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';

export default function DeviceProvider({ children }: PropsWithChildren) {
  const { initStream } = useDevice();
  const stream = useDeviceStore((state) => state.stream);

  useLocalAnalyser();

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
    const unlock = () => {
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
