'use client';

import { useEffect } from 'react';

import { useDeviceStore } from '@/store/useDeviceStore';
import { DEVICE_KINDS } from '@/types/deviceType';
import { inferPermissionFromDevices, queryDevicePermission } from '@/util/env';

const refreshUngrantedPermissions = async () => {
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

const recheckPermissionsOnRefocus = () => {
  if (document.hidden) {
    return;
  }
  refreshUngrantedPermissions();
};

const useWatchPermissionChange = () => {
  useEffect(() => {
    const statuses: PermissionStatus[] = [];

    const watchPermissions = async () => {
      try {
        const [audio, video] = await Promise.all([
          navigator.permissions.query({ name: 'microphone' }),
          navigator.permissions.query({ name: 'camera' }),
        ]);

        const syncPermissionState = async () => {
          const { permission: prev, status } = useDeviceStore.getState();
          if (status === 'pending' || (prev.audio === audio.state && prev.video === video.state)) {
            return;
          }

          useDeviceStore.setState({ isInit: true, permission: { audio: audio.state, video: video.state } });
        };

        syncPermissionState();

        if (!('onchange' in audio) || !('onchange' in video)) {
          throw new Error('permission API 미지원');
        }

        audio.onchange = syncPermissionState;
        video.onchange = syncPermissionState;
        statuses.push(audio, video);
      } catch {
        window.addEventListener('focus', recheckPermissionsOnRefocus);
        document.addEventListener('visibilitychange', recheckPermissionsOnRefocus);
      } finally {
        useDeviceStore.setState({
          isInit: true,
        });
      }
    };

    watchPermissions();

    return () => {
      statuses.forEach((status) => {
        status.onchange = null;
      });

      window.removeEventListener('focus', recheckPermissionsOnRefocus);
      document.removeEventListener('visibilitychange', recheckPermissionsOnRefocus);
    };
  }, []);
};

export default useWatchPermissionChange;
