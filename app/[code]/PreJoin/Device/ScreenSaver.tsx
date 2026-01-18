'use client';

import { useShallow } from 'zustand/shallow';

import { useDeviceStore } from '@/store/useDeviceStore';

interface ScreenSaverProps {
  onClickButton: () => void;
}

export default function ScreenSaver({ onClickButton }: ScreenSaverProps) {
  const { deviceEnable, permission, status } = useDeviceStore(
    useShallow((state) => ({
      deviceEnable: state.deviceEnable,
      permission: state.permission,
      status: state.status,
    })),
  );

  const getText = () => {
    if (!deviceEnable.video) {
      return '카메라가 꺼져 있음';
    }

    if (permission.audio === 'denied' && permission.video === 'denied') {
      return '카메라 및 비디오 장치 권한이 차단되었습니다.';
    }

    if (permission.video === 'denied') {
      return '회의에서 참여자들이 나를 보도록 하시겠습니까?';
    }

    if (status === 'pending') {
      return '카메라 불러오는 중';
    }

    return '';
  };

  const message = getText();

  if (deviceEnable.video && permission.video === 'granted' && status === 'success') {
    return null;
  }

  return (
    <>
      <div className='absolute top-0 left-0 z-2 flex size-full flex-col items-center justify-center bg-black'>
        <p className='text-1.5xl text-white'>{message}</p>
        {permission.video === 'denied' && (
          <button
            className='my-3.75 h-9 rounded-sm bg-[rgb(26,115,232)] px-6 text-sm text-white hover:bg-[rgb(26,109,222)]'
            type='button'
            onClick={onClickButton}
          >
            {permission.audio === 'denied' ? '장치 권한 허용하기' : '카메라를 허용합니다.'}
          </button>
        )}
      </div>
    </>
  );
}
