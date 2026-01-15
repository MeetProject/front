import { useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { DeviceSelectBox, Media, Visualizer } from '@/components';
import { useDeviceStore } from '@/store/useDeviceStore';

export default function AudioSetting() {
  const audioReference = useRef<HTMLAudioElement>(null);
  const timerReference = useRef<NodeJS.Timeout | null>(null);
  const [isPlay, setIsPlay] = useState(false);

  const { permission, stream } = useDeviceStore(
    useShallow((state) => ({
      permission: state.permission,
      stream: state.stream,
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

  return (
    <div className='flex flex-1 flex-col gap-6'>
      <div className='flex-1'>
        <p className='mb-2 text-sm font-medium text-[#1A73E8]'>마이크</p>
        <div className='flex items-center gap-2 [@media(max-width:640px)]:flex-col [@media(max-width:640px)]:items-start'>
          <div className='w-72 max-w-[calc(100svw-260px)] [@media(max-width:640px)]:w-full [@media(max-width:640px)]:max-w-[calc(100svw-208px)]'>
            <DeviceSelectBox type='audioInput' />
          </div>
          <div className='flex w-full flex-1 items-center justify-center'>
            {permission?.audio && <Visualizer stream={stream} />}
          </div>
        </div>
      </div>
      <div className='flex-1'>
        <p className='mb-2 text-sm font-medium text-[#1A73E8]'>스피커</p>
        <div className='flex items-center gap-2 [@media(max-width:640px)]:flex-col [@media(max-width:640px)]:items-start'>
          <div className='w-72 max-w-[calc(100svw-260px)] [@media(max-width:640px)]:w-full [@media(max-width:640px)]:max-w-[calc(100svw-208px)]'>
            <DeviceSelectBox type='audioOutput' />
          </div>
          <div className='flex w-full flex-1 items-center justify-center'>
            <button
              className='h-10 w-12 rounded-full text-sm text-[#444746] hover:bg-[#ECF2FC] hover:text-[#0B57D0] active:bg-[#D5E2F7]'
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
