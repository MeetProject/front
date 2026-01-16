'use client';

import { useCallback } from 'react';

import { getCurrentDeviceInfo } from '@/lib/device';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';

const useDevice = () => {
  const setMediaStream = useCallback(async (stream: MediaStream | null) => {
    const deviceInfo = await getCurrentDeviceInfo(stream);

    useDeviceStore.setState({
      device: deviceInfo.device,
      deviceList: deviceInfo.deviceList,
      status: 'success',
      stream,
    });
  }, []);

  const getConstraints = useCallback((config: { audio: boolean; video: boolean }, isExact: boolean) => {
    const { device } = useDeviceStore.getState();
    return {
      ...(config.audio && {
        audio: device.audioInput ? { deviceId: { [isExact ? 'exact' : 'ideal']: device.audioInput } } : true,
      }),
      ...(config.video && {
        video: device.videoInput ? { deviceId: { [isExact ? 'exact' : 'ideal']: device.videoInput } } : true,
      }),
    } as MediaStreamConstraints;
  }, []);

  const getStream = useCallback(
    async (constraint: Record<DeviceKindType, boolean>, isExact: boolean, isLast?: boolean) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(getConstraints(constraint, isExact));
        const deviceInfo = await getCurrentDeviceInfo(stream);

        useDeviceStore.setState({
          ...deviceInfo,
          permission: {
            audio: constraint.audio ? 'granted' : 'denied',
            video: constraint.video ? 'granted' : 'denied',
          },
          status: 'success',
          stream,
        });

        return stream;
      } catch (e) {
        const error = e as DOMException;
        if ((error.name === 'OverconstrainedError' || error.name === 'NotFoundError') && isExact) {
          return getStream(constraint, false, isLast);
        }

        if (error.name === 'NotAllowedError' && !isLast) {
          throw e;
        }

        useDeviceStore.setState({
          device: { audioInput: null, audioOutput: null, videoInput: null },
          deviceList: { audioInput: [], audioOutput: [], videoInput: [] },
          permission: {
            audio: constraint.audio && error.name !== 'NotAllowedError' ? 'granted' : 'denied',
            video: constraint.video && error.name !== 'NotAllowedError' ? 'granted' : 'denied',
          },
          status: error.name === 'NotAllowedError' ? 'rejected' : 'failed',
          stream: null,
        });
        return null;
      }
    },
    [getConstraints],
  );

  const initStream = useCallback(
    async (config?: { audio: boolean; video: boolean }) => {
      const { status, stream: prevStream } = useDeviceStore.getState();
      if (status === 'pending') {
        return;
      }

      useDeviceStore.setState({ status: 'pending' });
      if (prevStream) {
        prevStream.getTracks().forEach((track) => track.stop());
      }

      if (config) {
        try {
          return await getStream(config, true, true);
        } catch {
          return null;
        }
      }

      const attempts = [
        { audio: true, video: true },
        { audio: true, video: false },
        { audio: false, last: true, video: true },
      ];

      for (const { audio, last, video } of attempts) {
        try {
          return await getStream({ audio, video }, true, last);
        } catch {
          continue;
        }
      }
      return null;
    },
    [getStream],
  );

  const replaceNewTrack = useCallback(
    async (type: DeviceKindType, deviceId: string | null, isExact = true) => {
      const { stream, updatePermission } = useDeviceStore.getState();
      const constraint = deviceId
        ? {
            [type]: { deviceId: isExact ? { exact: deviceId } : { ideal: deviceId } },
          }
        : { [type]: true };

      try {
        const prevStream = stream ?? new MediaStream();
        const trackStream = await navigator.mediaDevices.getUserMedia(constraint);
        const newTrack = trackStream.getTracks().find((t) => t.kind === type);
        const oldTrack = stream?.getTracks().find((t) => t.kind === type);

        if (newTrack) {
          prevStream.addTrack(newTrack);
        }

        if (oldTrack) {
          oldTrack.stop();
          prevStream.removeTrack(oldTrack);
        }

        const updateStream = new MediaStream(prevStream.getTracks());
        await setMediaStream(updateStream);
        updatePermission(type, 'granted');
        return updateStream;
      } catch (e) {
        const error = e as DOMException;

        if (error.name === 'NotAllowedError') {
          updatePermission(type, 'denied');
          return;
        }
        if (isExact) return replaceNewTrack(type, deviceId, false);
        throw e;
      }
    },
    [setMediaStream],
  );

  const replaceTrack = useCallback(
    async (device: MediaDeviceInfo | null, type?: DeviceKindType) => {
      if (!device) {
        if (!type) {
          throw new Error('device가 null인 경우, type이 반드시 필요합니다.');
        }
        await replaceNewTrack(type, null, false);
        return;
      }

      if (device.kind === 'audiooutput') {
        const { changeDevice } = useDeviceStore.getState();
        changeDevice('audioOutput', device);
        return;
      }
      const deviceType = device.kind === 'audioinput' ? 'audio' : 'video';
      await replaceNewTrack(deviceType, device.deviceId, true);
    },
    [replaceNewTrack],
  );

  const toggleAudioTrack = useCallback(() => {
    const { deviceEnable, stream, toggleDeviceEnalbe } = useDeviceStore.getState();
    if (!stream) {
      return;
    }
    const prevEnable = deviceEnable.audio;
    toggleDeviceEnalbe('audio');

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !prevEnable;
    });

    return { ...deviceEnable, audio: !prevEnable };
  }, []);

  const toggleVideoTrack = useCallback(async () => {
    const {
      device: { videoInput },
      deviceEnable,
      stream,
      toggleDeviceEnalbe,
    } = useDeviceStore.getState();
    if (!stream) {
      return;
    }

    const prevEnable = deviceEnable.video;

    toggleDeviceEnalbe('video');

    if (!prevEnable) {
      await replaceNewTrack('video', videoInput?.deviceId ?? '', true);
      return;
    }

    stream.getVideoTracks().forEach((track) => {
      track.stop();
      stream.removeTrack(track);
    });

    return { ...deviceEnable, video: !prevEnable };
  }, [replaceNewTrack]);

  const initScreenStream = useCallback(async (audio: boolean) => {
    const { screenStream } = useDeviceStore.getState();

    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      useDeviceStore.setState({ screenStream: null });
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({ audio });
    useDeviceStore.setState({ screenStream: stream });
    return stream;
  }, []);

  return {
    initScreenStream,
    initStream,
    replaceTrack,
    toggleAudioTrack,
    toggleVideoTrack,
  };
};

export default useDevice;
