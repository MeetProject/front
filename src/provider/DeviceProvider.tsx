'use client';

import { PropsWithChildren, useEffect } from 'react';

import { useDevice, useLocalAnalyser } from '@/hook';
import { useSignaling } from '@/hook/useWebrtc/useSignaling';
import { resumeAudioContext } from '@/lib/audioGraph';
import { getCurrentDeviceInfo } from '@/lib/device';
import { resumeLocalAnalyser } from '@/lib/localAudio';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';
import { DevicePayloadType } from '@/types/session';
import { WS_URL } from '@/util/api';
import { inferPermissionFromDevices, queryDevicePermission } from '@/util/env';

const DEVICE_KINDS = ['audio', 'video'] as const;

const recheckPermissions = async () => {
  const { permission: current, status } = useDeviceStore.getState();
  if (status === null || status === 'pending') {
    return;
  }

  const targets = DEVICE_KINDS.filter((type) => current[type] !== 'granted');
  if (targets.length === 0) {
    return;
  }

  const queried = await Promise.all(targets.map((type) => queryDevicePermission(type)));
  const needInfer = queried.some((value) => value === null);
  const devices = needInfer ? await navigator.mediaDevices.enumerateDevices().catch(() => []) : [];

  const { updatePermission } = useDeviceStore.getState();
  targets.forEach((type, index) => {
    const value = queried[index];
    if (value) {
      if (value !== current[type]) {
        updatePermission(type, value);
      }
      return;
    }

    const kind = type === 'audio' ? 'audioinput' : 'videoinput';
    const inferred = inferPermissionFromDevices(devices.filter((device) => device.kind === kind));

    if (inferred === 'granted') {
      updatePermission(type, 'granted');
    }
  });
};

const handleFocusRecheck = () => {
  if (document.hidden) {
    return;
  }
  recheckPermissions();
};

export default function DeviceProvider({ children }: PropsWithChildren) {
  const { initStream, replaceTrack } = useDevice();
  const { publish } = useSignaling(WS_URL);
  const stream = useDeviceStore((state) => state.stream);

  useLocalAnalyser();

  useEffect(() => {
    const acquisition = { queue: Promise.resolve() };

    const acquireTrack = async (type: DeviceKindType) => {
      const { device, deviceEnable } = useDeviceStore.getState();
      const target = device[type === 'audio' ? 'audioInput' : 'videoInput'];

      try {
        const newTrack = target ? await replaceTrack(target) : await replaceTrack(null, type);

        if (type === 'audio' && newTrack && !deviceEnable.audio) {
          newTrack.enabled = false;
        }
      } catch {}
    };

    const handlePermissionChange = (
      next: Record<DeviceKindType, PermissionState>,
      prev: Record<DeviceKindType, PermissionState>,
    ) => {
      const { deviceEnable, status, stream: currentStream } = useDeviceStore.getState();

      if (status === null || status === 'pending') {
        return;
      }

      const missing = DEVICE_KINDS.filter((type) => {
        if (prev[type] === 'granted' || next[type] !== 'granted') {
          return false;
        }
        if (type === 'video' && !deviceEnable.video) {
          return false;
        }
        const tracks = type === 'audio' ? currentStream?.getAudioTracks() : currentStream?.getVideoTracks();
        return !tracks || tracks.length === 0;
      });

      missing.forEach((type) => {
        acquisition.queue = acquisition.queue.then(() => acquireTrack(type));
      });
    };

    const unsubscribe = useDeviceStore.subscribe((state, prevState) => {
      if (state.permission !== prevState.permission) {
        handlePermissionChange(state.permission, prevState.permission);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [replaceTrack]);

  useEffect(() => {
    const statuses: PermissionStatus[] = [];

    const initPermission = async () => {
      try {
        const [audio, video] = await Promise.all([
          navigator.permissions.query({ name: 'microphone' }),
          navigator.permissions.query({ name: 'camera' }),
        ]);

        const syncDevice = async () => {
          const { permission: prev, status } = useDeviceStore.getState();
          if (status === 'pending' || (prev.audio === audio.state && prev.video === video.state)) {
            return;
          }

          useDeviceStore.setState({ isInit: true, permission: { audio: audio.state, video: video.state } });
        };

        syncDevice();

        if (!('onchange' in audio) || !('onchange' in video)) {
          throw new Error('permission API 미지원');
        }

        audio.onchange = syncDevice;
        video.onchange = syncDevice;
        statuses.push(audio, video);
      } catch {
        window.addEventListener('focus', handleFocusRecheck);
        document.addEventListener('visibilitychange', handleFocusRecheck);
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

      window.removeEventListener('focus', handleFocusRecheck);
      document.removeEventListener('visibilitychange', handleFocusRecheck);
    };
  }, []);

  useEffect(() => {
    if (!stream) {
      return;
    }

    const handleDeviceChange = async () => {
      const deviceInfo = await getCurrentDeviceInfo(stream);
      useDeviceStore.setState({
        device: deviceInfo.device,
        deviceList: deviceInfo.deviceList,
      });
    };

    const handleTrackEnded = () => {
      const { status } = useDeviceStore.getState();
      if (status === 'pending') {
        return;
      }
      stream.getTracks().forEach((track) => track.removeEventListener('ended', handleTrackEnded));
      initStream(true);
    };

    const handleMuteChange = (e: Event) => {
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

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    stream.getTracks().forEach((track) => {
      track.addEventListener('ended', handleTrackEnded, { once: true });
      track.addEventListener('mute', handleMuteChange);
      track.addEventListener('unmute', handleMuteChange);
    });

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);

      stream.getTracks().forEach((track) => {
        track.removeEventListener('ended', handleTrackEnded);
        track.removeEventListener('mute', handleMuteChange);
        track.removeEventListener('unmute', handleMuteChange);
      });
    };
  }, [stream, initStream, publish]);

  useEffect(() => {
    const unlock = () => {
      resumeAudioContext();
      resumeLocalAnalyser();
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
