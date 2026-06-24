'use client';

import { useCallback } from 'react';

import { getCurrentDeviceInfo } from '@/lib/device';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';

const AUDIO_PROCESSING: MediaTrackConstraints & { voiceIsolation?: boolean } = {
  autoGainControl: true,
  echoCancellation: true,
  noiseSuppression: true,
  voiceIsolation: true,
};

const useDevice = () => {
  const setMediaStream = useCallback(async (stream: MediaStream | null) => {
    const deviceInfo = stream
      ? await getCurrentDeviceInfo(stream)
      : {
          device: { audioInput: null, audioOutput: null, videoInput: null },
          deviceList: { audioInput: [], audioOutput: [], videoInput: [] },
        };

    useDeviceStore.setState({
      device: deviceInfo.device,
      deviceList: deviceInfo.deviceList,
      status: 'success',
      stream,
    });
  }, []);

  const syncEnable = useCallback((stream: MediaStream, constraint: Record<DeviceKindType, boolean>) => {
    const { deviceEnable } = useDeviceStore.getState();

    if (constraint.audio && !deviceEnable.audio) {
      stream.getAudioTracks().forEach((track) => (track.enabled = false));
    }

    if (constraint.video && !deviceEnable.video) {
      stream.getVideoTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
      });
    }
  }, []);

  const getConstraints = useCallback((config: { audio: boolean; video: boolean }, isExact: boolean) => {
    const { device } = useDeviceStore.getState();
    return {
      ...(config.audio && {
        audio: {
          ...(device.audioInput && { deviceId: { [isExact ? 'exact' : 'ideal']: device.audioInput.deviceId } }),
          ...AUDIO_PROCESSING,
        },
      }),
      ...(config.video && {
        video: device.videoInput ? { deviceId: { [isExact ? 'exact' : 'ideal']: device.videoInput.deviceId } } : true,
      }),
    } as MediaStreamConstraints;
  }, []);

  const getStream = useCallback(
    async (constraint: Record<DeviceKindType, boolean>, isExact: boolean, isLast?: boolean, isSyncEnable?: boolean) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(getConstraints(constraint, isExact));
        const deviceInfo = await getCurrentDeviceInfo(stream);

        if (isSyncEnable) {
          syncEnable(stream, constraint);
        }

        const audioTracks = stream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();

        if (audioTracks.length > 1) {
          audioTracks.slice(1).forEach((track) => {
            track.stop();
            stream.removeTrack(track);
          });
        }
        if (videoTracks.length > 1) {
          videoTracks.slice(1).forEach((track) => {
            track.stop();
            stream.removeTrack(track);
          });
        }

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
    [getConstraints, syncEnable],
  );

  const initStream = useCallback(
    async (isSyncEnable?: boolean) => {
      const { status, stream: prevStream } = useDeviceStore.getState();
      if (status === 'pending') {
        return;
      }

      useDeviceStore.setState({ status: 'pending' });

      if (prevStream) {
        prevStream.getTracks().forEach((track) => {
          track.stop();
          prevStream.removeTrack(track);
        });
      }

      const attempts = [
        { audio: true, video: true },
        { audio: true, video: false },
        { audio: false, last: true, video: true },
      ];

      for (const { audio, last, video } of attempts) {
        try {
          const stream = await getStream({ audio, video }, true, last, isSyncEnable);
          if (stream) {
            return stream;
          }
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
      const audioOption = type === 'audio' ? AUDIO_PROCESSING : null;
      const constraint = deviceId
        ? {
            [type]: { deviceId: isExact ? { exact: deviceId } : { ideal: deviceId }, ...audioOption },
          }
        : { [type]: audioOption ?? true };

      try {
        const trackStream = await navigator.mediaDevices.getUserMedia(constraint);
        const newTrack = trackStream.getTracks().find((t) => t.kind === type) ?? null;

        const baseTracks = stream?.getTracks().filter((t) => t.kind !== type) ?? [];
        stream
          ?.getTracks()
          .filter((t) => t.kind === type)
          .forEach((track) => track.stop());

        const extraTracks = trackStream.getTracks().filter((t) => t.kind !== type);
        extraTracks.forEach((track) => track.stop());

        const nextStream = new MediaStream([...baseTracks, ...(newTrack ? [newTrack] : [])]);
        await setMediaStream(nextStream);
        updatePermission(type, 'granted');
        return newTrack;
      } catch (e) {
        const error = e as DOMException;

        if (error.name === 'NotAllowedError') {
          updatePermission(type, 'denied');
          return null;
        }
        if (isExact) {
          return replaceNewTrack(type, deviceId, false);
        }
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
        return await replaceNewTrack(type, null, false);
      }

      if (device.kind === 'audiooutput') {
        const { changeDevice } = useDeviceStore.getState();
        changeDevice('audioOutput', device);
        return null;
      }
      const deviceType = device.kind === 'audioinput' ? 'audio' : 'video';
      return await replaceNewTrack(deviceType, device.deviceId, true);
    },
    [replaceNewTrack],
  );

  const toggleAudioTrack = useCallback(() => {
    const { deviceEnable, stream, toggleDeviceEnable } = useDeviceStore.getState();
    if (!stream) {
      return;
    }

    const prevEnable = deviceEnable.audio;
    toggleDeviceEnable('audio');

    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !prevEnable;
    });

    return { ...deviceEnable, audio: !prevEnable };
  }, []);

  const toggleVideoTrack = useCallback(async () => {
    const {
      device: { videoInput },
      deviceEnable,
      stream,
      toggleDeviceEnable,
    } = useDeviceStore.getState();
    if (!stream) {
      return null;
    }

    const prevEnable = deviceEnable.video;
    toggleDeviceEnable('video');

    if (!prevEnable) {
      return await replaceNewTrack('video', videoInput?.deviceId ?? '', true);
    }

    stream.getVideoTracks().forEach((track) => {
      track.stop();
      stream.removeTrack(track);
    });

    return null;
  }, [replaceNewTrack]);

  const stopScreenStream = useCallback(() => {
    const { screenStream } = useDeviceStore.getState();
    if (!screenStream) {
      return;
    }
    screenStream.getTracks().forEach((track) => track.stop());
    useDeviceStore.setState({ screenStream: null });
  }, []);

  const initScreenStream = useCallback(
    async (audio: boolean) => {
      stopScreenStream();

      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ audio });
        useDeviceStore.setState({ screenStream: stream });
        return stream;
      } catch {}
    },
    [stopScreenStream],
  );

  const stopStream = useCallback(() => {
    const { stream } = useDeviceStore.getState();
    if (!stream) {
      return;
    }
    stream.getTracks().forEach((track) => track.stop());
    useDeviceStore.setState({ status: null, stream: null });
  }, []);

  return {
    initScreenStream,
    initStream,
    replaceTrack,
    stopScreenStream,
    stopStream,
    toggleAudioTrack,
    toggleVideoTrack,
  };
};

export default useDevice;
