'use client';

import { useEffect } from 'react';

import useDevice from './useDevice';

import { useDeviceStore } from '@/store/useDeviceStore';
import { DEVICE_KINDS, DeviceKindType } from '@/types/deviceType';

const useAcquireTrackOnPermissionGrant = () => {
  const { acquireTrack } = useDevice();

  useEffect(() => {
    const acquisition = { queue: Promise.resolve() };

    const getNewlyGrantedTypes = (
      next: Record<DeviceKindType, PermissionState>,
      prev: Record<DeviceKindType, PermissionState>,
    ) => {
      const { deviceEnable, status, stream } = useDeviceStore.getState();

      if (status === null || status === 'pending') {
        return [];
      }

      return DEVICE_KINDS.filter((type) => {
        if (prev[type] === 'granted' || next[type] !== 'granted') {
          return false;
        }
        if (type === 'video' && !deviceEnable.video) {
          return false;
        }
        const tracks = type === 'audio' ? stream?.getAudioTracks() : stream?.getVideoTracks();
        return !tracks || tracks.length === 0;
      });
    };

    const unsubscribe = useDeviceStore.subscribe((state, prevState) => {
      if (state.permission === prevState.permission) {
        return;
      }

      getNewlyGrantedTypes(state.permission, prevState.permission).forEach((type) => {
        acquisition.queue = acquisition.queue.then(async () => {
          await acquireTrack(type);
        });
      });
    });

    return () => {
      unsubscribe();
    };
  }, [acquireTrack]);
};

export default useAcquireTrackOnPermissionGrant;
