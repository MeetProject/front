'use client';

import Link from 'next/link';
import { useState } from 'react';

import CurrentDate from './CurrentDate';
import HelpMenu from './HelpMenu';
import IconButton from './IconButton';
//import InfoMenu from './InfoMenu';

import * as Icon from '@/asset/svg';
import { Feedback, MediaPermissionDialog } from '@/components';
import { useDeviceStore } from '@/store/useDeviceStore';

const ICON_PROPS = {
  fill: '#5f6368',
  height: 24,
  width: 24,
};

type Menu = 'feedback' | 'setting' | 'permission';

export default function Header() {
  /* const { client } = useClientStore(
    useShallow((state) => ({
      client: state.client,
    })),
  ); */

  const [menuStatus, setMenuStatus] = useState<Record<Menu, boolean>>({
    feedback: false,
    permission: false,
    setting: false,
  });

  const toggleMenu = (menu: Menu) => {
    setMenuStatus(
      (prev) => Object.fromEntries(Object.keys(prev).map((key) => [key, key === menu])) as Record<Menu, boolean>,
    );
  };

  const closeMenu = (menu: Menu) => {
    setMenuStatus((prev) => ({ ...prev, [menu]: false }));
  };

  const handleSettingClick = () => {
    const { permission } = useDeviceStore.getState();
    if (Object.values(permission).every((state) => state === 'granted')) {
      toggleMenu('setting');
      return;
    }
    toggleMenu('permission');
  };

  /* const handleSettingClose = () => {
    closeMenu('setting');
  }; */

  const handleFeedbackClick = () => {
    toggleMenu('feedback');
  };

  const handleFeedbackClose = () => {
    closeMenu('feedback');
  };

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
      <Feedback isOpen={menuStatus.feedback} onClose={handleFeedbackClose} />
      <MediaPermissionDialog isOpen={menuStatus.permission} onClose={() => toggleMenu('setting')} />
    </div>
  );
}
