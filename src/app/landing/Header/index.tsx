'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

import CurrentDate from './CurrentDate';
import HelpMenu from './HelpMenu';
import IconButton from './IconButton';

import * as Icon from '@/asset/svg';
import { Feedback, MediaPermissionDialog, Setting } from '@/components';
import { useDevice } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';
import { isChromium } from '@/util/env';

const ICON_PROPS = {
  className: 'fill-outline-dark',
  height: 24,
  width: 24,
};

type Menu = 'feedback' | 'setting' | 'permission';

export default function Header() {
  const [menuStatus, setMenuStatus] = useState<Menu | null>(null);
  const { initStream, stopStream } = useDevice();

  const handleSettingClick = useCallback(async () => {
    const chromium = isChromium();

    if (!chromium) {
      await initStream();
    }

    const { permission } = useDeviceStore.getState();
    const values = Object.values(permission);

    const hasGranted = values.some((status) => status === 'prompt');
    if (hasGranted) {
      setMenuStatus('permission');
      return;
    }

    if (chromium) {
      initStream();
    }

    setMenuStatus('setting');
  }, [initStream]);

  const handleSettingClose = useCallback(() => {
    setMenuStatus(null);
    stopStream();
  }, [stopStream]);

  const handleFeedbackClick = useCallback(() => {
    setMenuStatus('feedback');
  }, []);

  const handleFeedbackClose = useCallback(() => {
    setMenuStatus(null);
  }, []);

  const handlePermissionClose = useCallback(() => {
    setMenuStatus('setting');
  }, []);

  const BUTTON_LIST = [
    {
      icon: <Icon.Feedback {...ICON_PROPS} />,
      name: '문제 신고',
      onClick: handleFeedbackClick,
    },
    {
      icon: <Icon.Setting {...ICON_PROPS} />,
      name: '설정',
      onClick: handleSettingClick,
    },
  ];

  return (
    <div className='relative flex h-16 items-center justify-between px-4 py-8'>
      <Link className='flex h-10 items-center gap-2 whitespace-nowrap' href='/'>
        <Icon.Logo height={36} width={36} />
        <div className='flex justify-center max-[360px]:hidden'>
          <p className='text-1.5xl font-semibold text-gray-600'>Project</p>
          <p className='text-1.5xl font-medium text-gray-600'>Meet</p>
        </div>
      </Link>
      <div className='z-10 flex items-center bg-white whitespace-nowrap'>
        <div className='max-[610px]:hidden'>
          <CurrentDate />
        </div>
        <HelpMenu />

        {BUTTON_LIST.map((button) => (
          <IconButton key={button.name} name={button.name} onClick={button.onClick}>
            {button.icon}
          </IconButton>
        ))}
      </div>
      <Feedback isOpen={menuStatus === 'feedback'} onClose={handleFeedbackClose} />
      <MediaPermissionDialog isOpen={menuStatus === 'permission'} onClose={handlePermissionClose} />
      <Setting isOpen={menuStatus === 'setting'} onClose={handleSettingClose} />
    </div>
  );
}
