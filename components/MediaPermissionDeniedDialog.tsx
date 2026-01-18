'use client';

import Image from 'next/image';

import Dialog from './_shared/Dialog';

import { permissionCommon } from '@/asset/image';
import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';
import { useDeviceStore } from '@/store/useDeviceStore';

interface MediaPermissionDeniedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
}

export default function MediaPermissionDeniedDialog({ isOpen, onClose, zIndex }: MediaPermissionDeniedDialogProps) {
  const permission = useDeviceStore((state) => state.permission);

  const getDeniedDeviceName = () => {
    if (permission.audio === 'denied' && permission.video === 'denied') {
      return '마이크 및 카메라';
    }

    if (permission.audio === 'denied') {
      return '마이크';
    }

    return '카메라';
  };

  const deniedDevice = getDeniedDeviceName();

  return (
    <Dialog
      className='min-w-80 rounded-4xl'
      description={`${deniedDevice} 장치 권한을 허용해주세요.`}
      isOpen={isOpen}
      position='center'
      title={`거부된 ${deniedDevice} 장치 권한 재설정 방법`}
      zIndex={zIndex}
      onClose={() => onClose()}
    >
      <div className='relative flex w-160 max-w-full items-center rounded-[28px] bg-white px-8 pt-7.5 pb-10 [@media(max-width:540px)]:flex-col'>
        <div className='absolute top-2 right-2 rounded-full hover:bg-[#F0F1F1] active:bg-[#DEDFDF]'>
          <ButtonTag name='대화상자 닫기' position='bottom'>
            <button className='flex size-12 items-center justify-center' type='button' onClick={onClose}>
              <Icon.Delete fill='#444746' height={24} width={24} />
            </button>
          </ButtonTag>
        </div>
        <Image
          alt='permission'
          className='size-[322.5px] [@media(max-width:700px)]:size-43.75'
          src={permissionCommon}
        />
        <div className='font-googleSans px-10 pt-5'>
          <h1 className='mb-3.75 text-left text-[22px] text-[#444746]'>{`Meet에서 ${deniedDevice} 사용이 차단됨`}</h1>
          <ol className='list-decimal'>
            <li>
              <span className='inline'>
                브라우저의 주소 표시줄에서
                <span className='mx-1 inline-block align-middle'>
                  <Icon.PermissionSetting height={25} width={25} />
                </span>
                설정 아이콘을 클릭합니다.
              </span>
            </li>
            <li className='my-3.75'>
              <span className='inline'>{`차단된 ${deniedDevice} 권한을 허용합니다.`}</span>
            </li>
          </ol>
        </div>
      </div>
    </Dialog>
  );
}
