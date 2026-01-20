'use client';

import { useState } from 'react';

import DeviceButtons from './DeviceButtons';
/*
import * as Icon from '@/asset/svg';
import { isScreenShareSupported } from '@/util/env';

interface ControlButtonType {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  clickedIcon: React.FC<React.SVGProps<SVGSVGElement>>;
  disabledIcon?: React.FC<React.SVGProps<SVGSVGElement>>;
  onClick?: (value: boolean | 'disable') => void;
  shortcutKey?: string[];
  hidden?: boolean;
}

const CONTROL_BUTTON: ControlButtonType[] = [
  {
    name: '자막 사용(c)',
    type: 'caption',
    icon: <Icon.Cc {...CONTROL_BUTTON_OFF_PROPS} />,
    clickedIcon: <Icon.Cc {...CONTROL_BUTTON_ON_PROPS} />,
  },
  {
    clickedIcon: Icon.EmojiOn,
    icon: Icon.EmojiOff,
    name: '반응 보내기',
    onClick: () => {},
  },
  {
    clickedIcon: Icon.ScreenShare,
    disabledIcon: Icon.ScreenShare,
    hidden: !isScreenShareSupported,
    icon: Icon.ScreenShare,
    name: '발표 시작',
    onClick: () => {},
  },
  {
    clickedIcon: Icon.HandOn,
    icon: Icon.HandOff,
    name: '손들기(ctrl + alt + h)',
    onClick: () => {},
    shortcutKey: ['Control', 'Alt', 'h'],
  },
];
*/

import { Setting } from '@/components';
import { DeviceKindType } from '@/types/deviceType';

export default function CallControlls() {
  const [isOpenSetting, setIsOpenSetting] = useState<DeviceKindType | null>(null);
  const handleSettingClose = () => {
    setIsOpenSetting(null);
  };
  return (
    <div className='relative flex w-xl items-center gap-2 px-1.5'>
      <DeviceButtons onSettingButtonClick={(category: DeviceKindType) => setIsOpenSetting(category)} />
      <Setting category={isOpenSetting ?? 'audio'} isOpen={isOpenSetting !== null} onClose={handleSettingClose} />
    </div>
  );
}
