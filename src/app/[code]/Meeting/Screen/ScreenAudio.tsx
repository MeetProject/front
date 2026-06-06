'use client';

import { useEffect } from 'react';

import { useAudioStore } from '@/store/useAudioStore';
import { useDeviceStore } from '@/store/useDeviceStore';

// 참가자 오디오는 useAudioStore가 참가자별 <audio> 엘리먼트로 직접 재생한다(Google Meet 방식).
// 이 컴포넌트는 (1) 선택된 출력 장치를 모든 엘리먼트에 적용하고
// (2) 자동재생 정책으로 막힌 재생/AudioContext를 사용자 제스처에 복구하는 역할만 한다.
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
      useAudioStore.getState().resumeAudioContext();
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
