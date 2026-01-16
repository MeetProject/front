'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, MediaHTMLAttributes } from 'react';
import { useShallow } from 'zustand/shallow';

import { useDeviceStore } from '@/store/useDeviceStore';

interface MediaProps extends MediaHTMLAttributes<HTMLMediaElement> {
  tag: 'video' | 'audio';
  stream?: MediaStream;
}

const Media = forwardRef<HTMLMediaElement, MediaProps>(({ stream, tag, ...props }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    device: { audioOutput },
  } = useDeviceStore(
    useShallow((state) => ({
      device: state.device,
    })),
  );

  useImperativeHandle(ref, () => {
    const el = tag === 'audio' ? audioRef.current : videoRef.current;
    return el as HTMLMediaElement;
  });

  useEffect(() => {
    const el = tag === 'audio' ? audioRef.current : videoRef.current;
    if (!el) {
      return;
    }

    const applyDevice = async () => {
      if (!audioOutput || !('setSinkId' in HTMLMediaElement.prototype) || el.sinkId === audioOutput.deviceId) {
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
    if (tag === 'audio' || !videoRef.current || !stream) {
      return;
    }

    const updateStreamSrc = () => {
      if (!videoRef.current) {
        return;
      }
      const liveTracks = stream.getTracks().filter((track) => track.readyState === 'live');

      if (liveTracks.length === 0) {
        videoRef.current.srcObject = null;
        return;
      }

      const safeStream = new MediaStream(liveTracks);
      videoRef.current.srcObject = safeStream;
      videoRef.current.play().catch(() => {});
    };

    updateStreamSrc();

    stream?.getTracks().forEach((track) => {
      track.addEventListener('ended', updateStreamSrc);
    });

    return () => {
      stream?.getTracks().forEach((track) => {
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
