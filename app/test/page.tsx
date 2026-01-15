'use client';

import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

import { DeviceSelectBox, Media } from '@/components';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';

export default function Test() {
  const ref = useRef<HTMLVideoElement>(null);
  const { initStream } = useDevice();
  const { stream } = useDeviceStore(
    useShallow((state) => ({
      stream: state.stream,
    })),
  );

  useEffect(() => {
    if (!ref.current || !stream) return;

    const liveTracks = stream.getTracks().filter((t): t is MediaStreamTrack => t.readyState === 'live');

    if (liveTracks.length === 0) {
      // live track이 없으면 빈 스트림 대신 null 설정
      ref.current.srcObject = null;
      return;
    }

    const safeStream = new MediaStream(liveTracks);
    ref.current.srcObject = safeStream;

    ref.current.play().catch(() => {});
  }, [stream]);

  useEffect(() => {
    initStream();
  }, []);

  return (
    <div>
      <Media autoPlay={true} ref={ref} tag='video' />
      <div className='flex items-center'>
        <DeviceSelectBox type='audioInput' />
        <DeviceSelectBox type='audioOutput' />
        <DeviceSelectBox type='videoInput' />
      </div>
    </div>
  );
}
