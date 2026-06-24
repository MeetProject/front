'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, MediaHTMLAttributes } from 'react';

import { useDeviceStore } from '@/store/useDeviceStore';
import { canSelectOutputDevice } from '@/util/env';

interface MediaProps extends MediaHTMLAttributes<HTMLMediaElement> {
  tag: 'video' | 'audio';
  stream?: MediaStream;
}

const Media = forwardRef<HTMLMediaElement, MediaProps>(({ stream, tag, ...props }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const audioOutput = useDeviceStore((state) => state.device.audioOutput);

  useImperativeHandle(ref, () => {
    const el = tag === 'audio' ? audioRef.current : videoRef.current;
    return el as HTMLMediaElement;
  }, [tag]);

  useEffect(() => {
    const el = tag === 'audio' ? audioRef.current : videoRef.current;
    if (!el) {
      return;
    }

    const applyDevice = async () => {
      if (!audioOutput || !canSelectOutputDevice() || (el.sinkId || 'default') === audioOutput.deviceId) {
        return;
      }

      try {
        await el.setSinkId(audioOutput.deviceId);
        if (!el.paused && !el.ended && el.readyState) {
          el.play();
        }
      } catch {
        const { changeDevice, changeDeviceList, deviceList } = useDeviceStore.getState();
        const currentDevice = deviceList.audioOutput.find((device) => device.deviceId === el.sinkId);

        if (!currentDevice) {
          return;
        }

        changeDeviceList(
          'audioOutput',
          deviceList.audioOutput.filter((device) => device.deviceId !== audioOutput.deviceId),
        );
        changeDevice('audioOutput', currentDevice);
      }
    };

    applyDevice();
  }, [audioOutput, tag]);

  useEffect(() => {
    if (!stream) {
      return;
    }

    const el = tag === 'audio' ? audioRef.current : videoRef.current;
    if (!el) {
      return;
    }

    const kind = tag === 'audio' ? 'audio' : 'video';

    const hasSameTracks = () => {
      const current = el.srcObject;
      if (!(current instanceof MediaStream)) {
        return false;
      }
      const currentTracks = current.getTracks().filter((track) => track.kind === kind);
      const nextTracks = stream.getTracks().filter((track) => track.kind === kind);
      return currentTracks.length === nextTracks.length && nextTracks.every((track) => currentTracks.includes(track));
    };

    const updateStreamSrc = () => {
      if (el.srcObject === stream || hasSameTracks()) {
        return;
      }
      el.srcObject = stream;
      el.play().catch(() => {});
    };

    updateStreamSrc();

    stream.getTracks().forEach((track) => {
      track.addEventListener('ended', updateStreamSrc);
    });

    return () => {
      stream.getTracks().forEach((track) => {
        track.removeEventListener('ended', updateStreamSrc);
      });
    };
  }, [stream, tag]);

  if (tag === 'audio') {
    return <audio ref={audioRef} {...props} />;
  }
  return <video ref={videoRef} {...props} />;
});

Media.displayName = 'Media';

export default Media;
