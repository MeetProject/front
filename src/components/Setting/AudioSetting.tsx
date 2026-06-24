import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { DeviceSelectBox, LocalVisualizer, Media } from '@/components';
import { useDeviceStore } from '@/store/useDeviceStore';

interface AudioSettingProps {
  onDisabledClick: () => void;
}

export default function AudioSetting({ onDisabledClick }: AudioSettingProps) {
  const audioReference = useRef<HTMLAudioElement>(null);
  const timerReference = useRef<NodeJS.Timeout | null>(null);
  const isFirstReference = useRef(true);
  const [isPlay, setIsPlay] = useState(false);

  const { audioOutputId, permission } = useDeviceStore(
    useShallow((state) => ({
      audioOutputId: state.device.audioOutput?.deviceId,
      permission: state.permission,
    })),
  );

  const handleAudioTestButton = () => {
    if (!audioReference.current || isPlay) {
      return;
    }
    setIsPlay(true);
    audioReference.current.currentTime = 0;
    audioReference.current.play();
    timerReference.current = setTimeout(() => {
      if (audioReference.current) {
        audioReference.current.pause();
      }
      setIsPlay(false);
      timerReference.current = null;
    }, 4000);
  };

  useEffect(() => {
    if (isFirstReference.current) {
      isFirstReference.current = false;
      return;
    }

    if (timerReference.current) {
      clearTimeout(timerReference.current);
      timerReference.current = null;
    }
    audioReference.current?.pause();
    setIsPlay(false);
  }, [audioOutputId]);

  return (
    <div className='flex flex-1 flex-col gap-6'>
      <div className='flex-1'>
        <p className='text-primary-main mb-2 text-sm font-medium'>마이크</p>
        <div className='flex items-center gap-2 max-[640px]:flex-col max-[640px]:items-start'>
          <div className='w-72 max-w-[calc(100svw-260px)] max-[640px]:w-full max-[640px]:max-w-[calc(100svw-208px)]'>
            <DeviceSelectBox type='audioInput' onDisabledClick={onDisabledClick} />
          </div>
          <div className='flex w-full flex-1 items-center justify-center'>
            {permission?.audio === 'granted' && <LocalVisualizer />}
          </div>
        </div>
      </div>
      <div className='flex-1'>
        <p className='text-primary-main mb-2 text-sm font-medium'>스피커</p>
        <div className='flex items-center gap-2 max-[640px]:flex-col max-[640px]:items-start'>
          <div className='w-72 max-w-[calc(100svw-260px)] max-[640px]:w-full max-[640px]:max-w-[calc(100svw-208px)]'>
            <DeviceSelectBox type='audioOutput' onDisabledClick={onDisabledClick} />
          </div>
          <div className='flex w-full flex-1 items-center justify-center'>
            <button
              className='text-outline-dark hover:bg-primary-ghost hover:text-primary-dark active:bg-primary-container-bold h-10 w-12 rounded-full text-sm'
              disabled={isPlay}
              type='button'
              onClick={handleAudioTestButton}
            >
              {isPlay ? '재생 중' : '테스트'}
            </button>
          </div>
        </div>
      </div>
      <Media ref={audioReference} src='/audio/soundTest.mp3' tag='audio' />
    </div>
  );
}
