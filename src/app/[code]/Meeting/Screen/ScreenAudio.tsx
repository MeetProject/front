'use client';

import { useEffect } from 'react';

import { useAudioStore } from '@/store/useAudioStore';
import { useDeviceStore } from '@/store/useDeviceStore';

// 참가자 오디오는 AudioContext.destination으로 출력되므로 별도 <audio> 엘리먼트는 두지 않는다.
// 이 컴포넌트는 (1) 선택된 스피커를 AudioContext.setSinkId로 동기화하고
// (2) Safari 등 자동재생 정책으로 suspended 된 컨텍스트를 사용자 제스처에 resume 하는 역할만 한다.
export default function ScreenAudio() {
  const audioOutput = useDeviceStore((state) => state.device.audioOutput);

  useEffect(() => {
    if (!audioOutput?.deviceId) {
      return;
    }
    useAudioStore.getState().setOutputDevice(audioOutput.deviceId);
  }, [audioOutput]);

  useEffect(() => {
    const unlock = () => {
      const { audioOutput: output } = useDeviceStore.getState().device;
      const { resumeAudioContext, setOutputDevice } = useAudioStore.getState();
      resumeAudioContext();
      if (output?.deviceId) {
        setOutputDevice(output.deviceId);
      }
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

  return null;
}
