'use client';

import Image from 'next/image';

import PermissionButton from './PermissionButton';

import * as image from '@/asset/image';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';

const CONTENT = {
  audio: {
    deny: '마이크 없이 계속',
    title: '회의에서 참여자들이 나를 듣도록 하시겠습니까?',
  },
  both: {
    deny: '마이크 및 카메라 없이 계속',
    title: '회의에서 참여자들이 나를 보고 듣도록 하시겠습니까?',
  },
  video: {
    deny: '카메라 없이 계속',
    title: '회의에서 참여자들이 나를 보도록 하시겠습니까?',
  },
};

export default function MediaPermissionPrompt() {
  const permission = useDeviceStore((state) => state.permission);

  const getStatus = (value: Record<DeviceKindType, PermissionState>) => {
    if (value.audio !== 'granted' && permission.video !== 'granted') {
      return 'both';
    }
    if (value.audio !== 'granted') {
      return 'audio';
    }
    return 'video';
  };

  const status = getStatus(permission);

  return (
    <div className='flex w-160 max-w-full flex-col items-center justify-center rounded-4xl p-8'>
      <div className='flex-1 text-center'>
        <Image
          alt='requestPermission'
          className='mt-4 mb-2 h-50 w-76 [@media(max-width:600px)]:m-0 [@media(max-width:600px)]:h-24 [@media(max-width:600px)]:w-43.75'
          height={176}
          src={image.permission}
          width={320}
        />
      </div>

      <div className='font-google-sans px-10 pt-5 text-center [@media(max-width:600px)]:px-0'>
        <h1 className='font-google-sans mb-4 text-2xl tracking-normal'>{CONTENT[status].title}</h1>
        <p className='text-zinc-700. text-[14px]'>회의 중에 언제든지 마이크 및 카메라를 끌 수 있습니다.</p>
        <PermissionButton type={status} />
        <button
          className='font-google-sans my-1 h-12 rounded-4xl px-3 text-[14px] font-medium text-blue-700 hover:bg-[rgba(11,87,208,0.1)] [@media(max-width:600px)]:text-xs'
          type='button'
        >
          {CONTENT[status].deny}
        </button>
      </div>
    </div>
  );
}
