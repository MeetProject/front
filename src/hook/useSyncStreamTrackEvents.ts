'use client';

import { useEffect } from 'react';

import useDevice from './useDevice';
import { useSignaling } from './useWebrtc/useSignaling';

import { getCurrentDeviceInfo } from '@/lib/device';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';
import { DevicePayloadType } from '@/types/session';
import { WS_URL } from '@/util/api';

const useSyncStreamTrackEvents = () => {
  const { initStream } = useDevice();
  const { publish } = useSignaling(WS_URL);
  const stream = useDeviceStore((state) => state.stream);

  useEffect(() => {
    if (!stream) {
      return;
    }

    const refreshDeviceInfo = async () => {
      const deviceInfo = await getCurrentDeviceInfo(stream);
      useDeviceStore.setState({
        device: deviceInfo.device,
        deviceList: deviceInfo.deviceList,
      });
    };

    const reacquireStreamOnTrackEnded = () => {
      const { status } = useDeviceStore.getState();
      if (status === 'pending') {
        return;
      }
      stream.getTracks().forEach((track) => track.removeEventListener('ended', reacquireStreamOnTrackEnded));
      initStream(true);
    };

    const syncDeviceEnableWithMute = (e: Event) => {
      const track = e.target as MediaStreamTrack;
      const type: DeviceKindType = track.kind === 'audio' ? 'audio' : 'video';
      const value = e.type === 'unmute';

      const { deviceEnable, toggleDeviceEnable } = useDeviceStore.getState();
      if (deviceEnable[type] === value) {
        return;
      }

      toggleDeviceEnable(type);
      publish<DevicePayloadType>('/app/device', { mediaOption: { ...deviceEnable, [type]: value } });
    };

    navigator.mediaDevices.addEventListener('devicechange', refreshDeviceInfo);

    stream.getTracks().forEach((track) => {
      track.addEventListener('ended', reacquireStreamOnTrackEnded, { once: true });
      track.addEventListener('mute', syncDeviceEnableWithMute);
      track.addEventListener('unmute', syncDeviceEnableWithMute);
    });

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refreshDeviceInfo);

      stream.getTracks().forEach((track) => {
        track.removeEventListener('ended', reacquireStreamOnTrackEnded);
        track.removeEventListener('mute', syncDeviceEnableWithMute);
        track.removeEventListener('unmute', syncDeviceEnableWithMute);
      });
    };
  }, [stream, initStream, publish]);
};

export default useSyncStreamTrackEvents;
