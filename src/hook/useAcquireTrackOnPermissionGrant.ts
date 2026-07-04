'use client';

import { useEffect } from 'react';

import useDevice from './useDevice';

import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';

const DEVICE_KINDS = ['audio', 'video'] as const;

const useAcquireTrackOnPermissionGrant = () => {
  const { replaceTrack } = useDevice();

  useEffect(() => {
    const acquisition = { queue: Promise.resolve() };

    const acquireMissingTrack = async (type: DeviceKindType) => {
      const { device, deviceEnable } = useDeviceStore.getState();
      const target = device[type === 'audio' ? 'audioInput' : 'videoInput'];

      try {
        const newTrack = target ? await replaceTrack(target) : await replaceTrack(null, type);

        if (type === 'audio' && newTrack && !deviceEnable.audio) {
          newTrack.enabled = false;
        }
      } catch {}
    };

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
        acquisition.queue = acquisition.queue.then(() => acquireMissingTrack(type));
      });
    });

    return () => {
      unsubscribe();
    };
  }, [replaceTrack]);
};

export default useAcquireTrackOnPermissionGrant;
