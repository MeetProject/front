'use client';

import { useEffect } from 'react';

import { useAudioStore } from '@/store/useAudioStore';
import { useDeviceStore } from '@/store/useDeviceStore';

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
