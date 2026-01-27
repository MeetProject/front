'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import Dialog from '../_shared/Dialog';

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

interface MediaPermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaPermissionDialog({ isOpen, onClose }: MediaPermissionDialogProps) {
  const { permission } = useDeviceStore(
    useShallow((state) => ({
      permission: state.permission,
    })),
  );

  const getStatus = (value: Record<DeviceKindType, PermissionState>) => {
    if (value.audio === 'prompt' && value.video === 'prompt') {
      return 'both';
    }
    if (value.audio === 'prompt') {
      return 'audio';
    }
    return 'video';
  };

  const status = getStatus(permission);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const values = Object.values(permission);

    const hasNoPrompt = values.every((s) => s !== 'prompt');

    if (hasNoPrompt) {
      onClose();
      return;
    }
  }, [permission, onClose, isOpen]);

  return (
    <Dialog
      className='min-w-80 rounded-4xl'
      closeOnOutsideClick={false}
      description='장치 권한을 허용해주세요.'
      isOpen={isOpen}
      position='center'
      title='장치 권한 요청'
      onClose={onClose}
    >
      <div className='flex w-160 max-w-full flex-col items-center justify-center rounded-4xl p-8'>
        <div className='flex-1 text-center'>
          <Image
            alt='requestPermission'
            className='mt-4 mb-2 h-50 w-76 max-[600px]:m-0 max-[600px]:h-24 max-[600px]:w-43.75'
            height={176}
            src={image.permission}
            width={320}
          />
        </div>

        <div className='font-google-sans px-10 pt-5 text-center max-[600px]:px-0'>
          <h1 className='font-google-sans mb-4 text-2xl tracking-normal'>{CONTENT[status].title}</h1>
          <p className='text-zinc-700. text-[14px]'>회의 중에 언제든지 마이크 및 카메라를 끌 수 있습니다.</p>
          <PermissionButton type={status} />
          <button
            className='font-google-sans my-1 h-12 rounded-4xl px-3 text-[14px] font-medium text-blue-700 hover:bg-[rgba(11,87,208,0.1)] max-[600px]:text-xs'
            type='button'
          >
            {CONTENT[status].deny}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
