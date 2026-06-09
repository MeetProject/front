'use client';

import { useState } from 'react';

import ButtonTag from '../ButtonTag';

import * as Icon from '@/asset/svg';
import { useDevice } from '@/hook';
import { cn } from '@/lib/cn';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';

interface PermissionButtonProps {
  type: DeviceKindType | 'both';
}

const ICON_PROPS = {
  className: 'absolute top-1/2 left-20 -translate-y-1/2 max-[600px]:left-8 fill-white',
  height: 18,
  width: 18,
};

interface ButtonType {
  name: string;
  value: DeviceKindType;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const CONTENT = {
  audio: {
    icon: <Icon.Mic {...ICON_PROPS} />,
    option: false,
    request: '마이크 사용',
  },
  both: {
    icon: <Icon.VideoOn {...ICON_PROPS} />,
    option: true,
    request: '마이크 및 카메라 사용',
  },
  video: {
    icon: <Icon.VideoOn {...ICON_PROPS} />,
    option: false,
    request: '카메라 사용',
  },
};

const BUTTON: ButtonType[] = [
  { icon: Icon.Mic, name: '마이크', value: 'audio' },
  { icon: Icon.VideoOn, name: '비디오', value: 'video' },
];

export default function PermissionButton({ type }: PermissionButtonProps) {
  const [isOpenOption, setIsOpenOption] = useState(false);
  const { initStream, replaceTrack } = useDevice();

  const status = CONTENT[type];

  const handleOptionButtonClick = () => {
    setIsOpenOption((prev) => !prev);
  };

  const handleRequestButtonClick = async (deviceType: DeviceKindType | 'both') => {
    if (deviceType === 'both') {
      await initStream();
      return;
    }
    const { device } = useDeviceStore.getState();
    await replaceTrack(device[deviceType === 'audio' ? 'audioInput' : 'videoInput'], deviceType);
    setIsOpenOption(false);
  };

  return (
    <div className='relative mt-6.25 mb-4 flex flex-1 flex-col items-center justify-center'>
      <div className='flex items-center justify-center'>
        <div className='relative mx-2'>
          <button
            className='bg-primary-dark hover:bg-primary-selection mx-2 flex h-11 min-w-46 items-center justify-center rounded-3xl pr-16 pl-24 text-[14px] text-white max-[600px]:pr-8 max-[600px]:pl-12 max-[600px]:text-xs'
            type='button'
            onClick={() => handleRequestButtonClick(type)}
          >
            {status.request}
          </button>
          {status.icon}
        </div>
        {status.option && (
          <ButtonTag gap={8} name={isOpenOption ? '옵션 간단히 보기' : '옵션 더보기'} position='top'>
            <button
              className='flex size-10 items-center justify-center rounded-full border hover:bg-gray-300'
              type='button'
              onClick={handleOptionButtonClick}
            >
              <Icon.Chevron
                className={cn(isOpenOption && 'rotate-180', 'fill-outline-dark transition-transform duration-300')}
                height={12}
                width={12}
              />
            </button>
          </ButtonTag>
        )}
      </div>
      {isOpenOption && (
        <div className='mt-4 flex items-center justify-center gap-6 max-[600px]:flex-col max-[600px]:gap-3'>
          {BUTTON.map(({ icon: IconComponent, name, value }) => (
            <div className='border-primary-main relative rounded-3xl border hover:bg-blue-50' key={value}>
              <button
                className='text-primary-main flex h-11 items-center justify-center pr-10 pl-16 text-sm'
                type='button'
                onClick={() => handleRequestButtonClick(value)}
              >
                {`${name} 사용`}
              </button>
              <IconComponent
                className='fill-primary-main absolute top-1/2 left-10 -translate-y-1/2'
                height={18}
                width={18}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
