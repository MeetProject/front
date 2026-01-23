'use client';

import { useShallow } from 'zustand/shallow';

import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';
import { useDrawerStore } from '@/store/useDrawer';
import { RightDrawerKeyType } from '@/types/drawerType';

interface SingleButtonProps {
  type: RightDrawerKeyType;
  onClick?: () => void;
  align?: 'center' | 'right';
}

const BUTTON_TYPE = {
  chat: { iconOff: Icon.ChatOff, iconOn: Icon.ChatOn, name: '모든 사용자와 채팅' },
  info: { iconOff: Icon.InfoOff, iconOn: Icon.InfoOn, name: '회의 세부정보' },
};

export function Button({ align = 'center', onClick, type }: SingleButtonProps) {
  const { isOpen, toggleDrawer } = useDrawerStore(
    useShallow((state) => ({
      isOpen: state[type],
      toggleDrawer: state.toggleDrawer,
    })),
  );

  const config = BUTTON_TYPE[type];
  const IconComponent = isOpen ? config.iconOn : config.iconOff;
  const handleButtonClick = () => {
    onClick?.();
    toggleDrawer(type);
  };

  return (
    <ButtonTag align={align} name={config.name}>
      <button
        className='hover:bg-device-button-hover-bg flex size-12 items-center justify-center rounded-full'
        type='button'
        onClick={handleButtonClick}
      >
        <IconComponent className={isOpen ? 'fill-device-button-selected-bg' : 'fill-white'} height={24} width={24} />
      </button>
    </ButtonTag>
  );
}
