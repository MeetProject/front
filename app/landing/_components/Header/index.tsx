'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

import CurrentDate from './CurrentDate';
import HelpMenu from './HelpMenu';
import IconButton from './IconButton';
//import InfoMenu from './InfoMenu';

import * as Icon from '@/asset/svg';
import { Feedback, MediaPermissionDialog, Setting } from '@/components';
import useDevice from '@/hook/useDevice';
import { useDeviceStore } from '@/store/useDeviceStore';
import { isChromium } from '@/util/env';

const ICON_PROPS = {
  fill: '#5f6368',
  height: 24,
  width: 24,
};

type Menu = 'feedback' | 'setting' | 'permissionRequire' | 'permissionDeny';

export default function Header() {
  /* const { client } = useClientStore(
    useShallow((state) => ({
      client: state.client,
    })),
  ); */

  const [menuStatus, setMenuStatus] = useState<Menu | null>(null);
  const { initStream } = useDevice();

  const handleSettingClick = useCallback(async () => {
    const chromium = isChromium();

    if (!chromium) {
      await initStream();
    }

    const { permission } = useDeviceStore.getState();
    const values = Object.values(permission);

    const allDeny = values.every((status) => status === 'denied');

    if (allDeny) {
      setMenuStatus('permissionDeny');
      return;
    }

    const hasGranted = values.some((status) => status === 'prompt');
    if (hasGranted) {
      setMenuStatus('permissionRequire');
      return;
    }

    await initStream();
    setMenuStatus('setting');
  }, [initStream]);

  const handleSettingClose = useCallback(() => {
    const { stopStream } = useDeviceStore.getState();
    setMenuStatus(null);
    stopStream();
  }, []);

  const handleFeedbackClick = useCallback(() => {
    setMenuStatus('feedback');
  }, []);

  const handleFeedbackClose = useCallback(() => {
    setMenuStatus(null);
  }, []);

  const handlePermissionClose = useCallback((value: 'setting' | null) => {
    setMenuStatus(value);
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
    <div className='relative h-16'>
      <Link
        className='absolute top-1/2 left-5 flex h-10 -translate-y-1/2 items-center gap-2 whitespace-nowrap'
        href='/'
      >
        <Icon.Logo height={36} width={36} />
        <p className='text-1.5xl font-semibold text-gray-600'>Meet</p>
        <p className='text-1.5xl font-medium text-gray-600'>Project</p>
      </Link>
      <div className='absolute top-1/2 right-5 z-10 flex -translate-y-1/2 items-center bg-white whitespace-nowrap'>
        <div>
          <CurrentDate />
        </div>
        <HelpMenu />

        {BUTTON_LIST.map((button) => (
          <IconButton key={button.name} name={button.name} onClick={button.onClick}>
            {button.icon}
          </IconButton>
        ))}
        {/* {client && <InfoMenu />} */}
      </div>
      <Feedback isOpen={menuStatus === 'feedback'} onClose={handleFeedbackClose} />
      <MediaPermissionDialog
        isOpen={menuStatus === 'permissionDeny' || menuStatus === 'permissionRequire'}
        type={menuStatus === 'permissionDeny' || menuStatus === 'permissionRequire' ? menuStatus : null}
        onClose={handlePermissionClose}
      />
      <Setting isOpen={menuStatus === 'setting'} onClose={handleSettingClose} />
    </div>
  );
}
