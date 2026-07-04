'use client';

import { useShallow } from 'zustand/shallow';

import { useDeviceStore } from '@/store/useDeviceStore';

interface ScreenSaverProps {
  onClickButton: () => void;
}

export default function ScreenSaver({ onClickButton }: ScreenSaverProps) {
  const { deviceEnable, deviceList, permission, status } = useDeviceStore(
    useShallow((state) => ({
      deviceEnable: state.deviceEnable,
      deviceList: state.deviceList,
      permission: state.permission,
      status: state.status,
    })),
  );

  const isSettled = status === 'success' || status === 'rejected' || status === 'failed';
  const hasCamera = deviceList.videoInput.length > 0;
  const isVideoBlocked = permission.video === 'denied' || (permission.video === 'prompt' && isSettled && hasCamera);

  const getText = () => {
    if (!deviceEnable.video) {
      return '카메라가 꺼져 있음';
    }

    if (permission.audio === 'denied' && permission.video === 'denied') {
      return '카메라 및 마이크 장치 권한이 차단되었습니다.';
    }

    if (isVideoBlocked) {
      return '회의에서 참여자들이 나를 보도록 하시겠습니까?';
    }

    if (status === 'failed' || (permission.video === 'prompt' && isSettled && !hasCamera)) {
      return '카메라를 불러올 수 없습니다';
    }

    return '카메라 불러오는 중';
  };

  const message = getText();

  if (deviceEnable.video && permission.video === 'granted' && status === 'success') {
    return null;
  }

  return (
    <>
      <div className='absolute top-0 left-0 z-2 flex size-full flex-col items-center justify-center bg-black'>
        <p className='text-1.5xl text-white'>{message}</p>
        {isVideoBlocked && (
          <button
            className='bg-primary-main hover:bg-primary-main-hover my-3.75 h-9 rounded-sm px-6 text-sm text-white'
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
