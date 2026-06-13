'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Dialog from '../_shared/Dialog';
import MediaPermissionDeniedDialog from '../MediaPermissionDeniedDialog';

import AudioSetting from './AudioSetting';
import CategoryButton from './CategoryButton';
import VideoSetting from './VideoSetting';

import * as Icon from '@/asset/svg';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';

interface SettingProps {
  isOpen: boolean;
  onClose: () => void;
  category?: DeviceKindType;
}
const CATEGORY_BUTTONS = [
  { icon: Icon.Speaker, name: '오디오', value: 'audio' },
  { icon: Icon.VideoOn, name: '비디오', value: 'video' },
] as const;

export default function Setting({ category = 'audio', isOpen, onClose }: SettingProps) {
  const isInitial = useRef<boolean>(true);
  const [currentCategory, setCurrentCategory] = useState<DeviceKindType>(category);
  const [isOpenDeniedDialog, setIsOpenDeniedDialog] = useState<boolean>(false);

  const { initStream } = useDevice();
  const isInit = useDeviceStore((state) => state.isInit);

  const handleClose = () => {
    onClose();
  };

  const handleDeniedDialogOpen = useCallback(() => {
    setIsOpenDeniedDialog(true);
  }, []);

  useEffect(() => {
    if (isInitial.current || !isInit || !isOpen) {
      isInitial.current = false;
      return;
    }

    setIsOpenDeniedDialog(false);
    initStream(true);
  }, [isInit, initStream, isOpen]);

  useEffect(() => {
    setCurrentCategory(category);
  }, [category]);

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
          <aside className='border-outline-light h-full w-[256px] border-r max-[640px]:w-20'>
            <h1 className='text-1.5xl text-surface-base px-6 pt-6 font-medium max-[640px]:hidden'>설정</h1>
            <nav className='mt-6 mr-2'>
              {CATEGORY_BUTTONS.map(({ icon, name, value }) => (
                <CategoryButton
                  icon={icon}
                  isActive={currentCategory === value}
                  key={value}
                  name={name}
                  onSelect={() => setCurrentCategory(value)}
                />
              ))}
            </nav>
          </aside>

          <button
            aria-label='닫기'
            className='absolute top-3 right-3 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200'
            type='button'
            onClick={onClose}
          >
            <Icon.Delete className='fill-outline-dark' height={24} width={24} />
          </button>

          <main className='mx-12 my-6 flex flex-1 pt-8'>
            <div className='w-full'>
              {currentCategory === 'audio' ? (
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
