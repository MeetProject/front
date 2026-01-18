'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Dialog from '../_shared/Dialog';
import MediaPermissionDeniedDialog from '../MediaPermissionDeniedDialog';

import AudioSetting from './AudioSetting';
import VideoSetting from './VideoSetting';

import * as Icon from '@/asset/svg';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';

interface SettingProps {
  isOpen: boolean;
  onClose: () => void;
}
const CATEGORY_BUTTONS = [
  { icon: Icon.Speaker, name: '오디오', value: 'audio' },
  { icon: Icon.VideoOn, name: '비디오', value: 'video' },
] as const;

export default function Setting({ isOpen, onClose }: SettingProps) {
  const isInitial = useRef<boolean>(true);
  const [category, setCategory] = useState<DeviceKindType>('audio');
  const [isOpenDeniedDialog, setIsOpenDeniedDialog] = useState<boolean>(false);

  const { initStream } = useDevice();
  const isInit = useDeviceStore((state) => state.isInit);

  const getButtonStyles = (isActive: boolean) => ({
    container: `group relative flex h-12 w-full items-center gap-3 rounded-r-full px-6 transition-all ${
      isActive ? 'z-10 bg-[#E8F0FE] hover:shadow-md' : 'bg-white hover:bg-[#F9F9F9]'
    }`,
    iconFill: isActive ? '#1967D2' : '#5F6368',
    text: `[@media(max-width:640px)]:hidden ${isActive ? 'text-[#1967D2] font-medium' : 'text-[#5F6368]'}`,
  });

  const handleClose = () => {
    onClose();
    setCategory('audio');
  };

  const handleDeniedDialogOpen = useCallback(() => {
    setIsOpenDeniedDialog(true);
  }, []);

  useEffect(() => {
    if (isInitial.current || !isInit || !isOpen) {
      isInitial.current = false;
      useDeviceStore.setState({ isInit: false });
      return;
    }

    useDeviceStore.setState({ isInit: false });
    setIsOpenDeniedDialog(false);
    initStream();
  }, [isInit, initStream, isOpen]);

  return (
    <>
      <Dialog
        className='min-w-80 rounded-4xl'
        description='설정'
        isOpen={isOpen}
        position='center'
        onClose={handleClose}
      >
        <div className='font-googleSans relative flex h-162.5 w-200 max-w-full rounded-lg bg-white shadow-xl'>
          <aside className='h-full w-[256px] border-r border-[#DADCE0] [@media(max-width:640px)]:w-20'>
            <h1 className='text-1.5xl px-6 pt-6 font-medium text-[#202124] [@media(max-width:640px)]:hidden'>설정</h1>
            <nav className='mt-6 mr-2'>
              {CATEGORY_BUTTONS.map(({ icon: IconComponent, name, value }) => {
                const isActive = category === value;
                const styles = getButtonStyles(isActive);

                return (
                  <button
                    aria-selected={isActive}
                    className={styles.container}
                    key={value}
                    type='button'
                    onClick={() => setCategory(value)}
                  >
                    <IconComponent className='transition-colors' fill={styles.iconFill} height={24} width={24} />
                    <span className={styles.text}>{name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <button
            aria-label='닫기'
            className='absolute top-3 right-3 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200'
            type='button'
            onClick={onClose}
          >
            <Icon.Delete fill='#5F6368' height={24} width={24} />
          </button>

          <main className='mx-12 my-6 flex flex-1 pt-8'>
            <div className='w-full'>
              {category === 'audio' ? (
                <AudioSetting onDisabledClick={handleDeniedDialogOpen} />
              ) : (
                <VideoSetting onDisabledClick={handleDeniedDialogOpen} />
              )}
            </div>
          </main>
        </div>
      </Dialog>
      <MediaPermissionDeniedDialog
        isOpen={isOpenDeniedDialog}
        zIndex={2200}
        onClose={() => setIsOpenDeniedDialog(false)}
      />
    </>
  );
}
