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

  const getStream = useCallback(
    async (constraints?: MediaStreamConstraints) => {
      const { updatePermission } = useDeviceStore.getState();
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (constraints?.audio) {
          updatePermission('audio', 'granted');
        }

        if (constraints?.video) {
          updatePermission('video', 'granted');
        }
        await setMediaStream(stream);
        return stream;
      } catch (e) {
        const error = e as DOMException;
        if (error.name === 'NotAllowedError') {
          if (constraints?.audio) {
            updatePermission('audio', 'denied');
          }
          if (constraints?.video) {
            updatePermission('video', 'denied');
          }
        }
        throw e;
      }
    },
    [setMediaStream],
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

  const initStream = useCallback(
    async (constraint?: MediaStreamConstraints) => {
      const {
        device: { audioInput, videoInput },
        status,
        stream: prevStream,
      } = useDeviceStore.getState();

      if (status === 'pending') {
        return;
      }

      useDeviceStore.setState({ status: 'pending' });

      if (prevStream) {
        prevStream.getTracks().forEach((track) => track.stop());
      }

      try {
        return await getStream(
          constraint ?? {
            audio: audioInput ? { deviceId: { exact: audioInput.deviceId } } : true,
            video: videoInput ? { deviceId: { exact: videoInput.deviceId } } : true,
          },
        );
      } catch (e) {
        const error = e as DOMException;
        console.log(error);
        if (error.name === 'NotAllowedError') {
          useDeviceStore.setState({ status: 'rejected', stream: null });
          return null;
        }

        if (error.name === 'OverconstrainedError' || error.name === 'NotFoundError') {
          try {
            return await getStream({
              audio: audioInput ? { deviceId: { ideal: audioInput.deviceId } } : true,
              video: videoInput ? { deviceId: { ideal: videoInput.deviceId } } : true,
            });
          } catch {
            useDeviceStore.setState({ status: 'failed', stream: null });
            return null;
          }
        }

        try {
          return await getStream({ audio: audioInput ? { deviceId: { exact: audioInput.deviceId } } : true });
        } catch {
          try {
            return await getStream({
              video: videoInput ? { deviceId: { exact: videoInput.deviceId } } : true,
            });
          } catch {
            useDeviceStore.setState({ status: 'failed', stream: null });
            return null;
          }
        }
      }
    },
    [getStream],
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
