'use client';

import { useShallow } from 'zustand/shallow';

import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';
import { useDrawerStore } from '@/store/useDrawer';
import { RightDrawerKeyType } from '@/types/drawerType';

interface ButtonType {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  isOpen: boolean;
  name: string;
  value: RightDrawerKeyType;
}

export default function MeetingAuxControls() {
  const { chat, info } = useDrawerStore(
    useShallow((state) => ({
      chat: state.chat,
      info: state.info,
    })),
  );

  const BUTTON: ButtonType[] = [
    {
      icon: info ? Icon.InfoOn : Icon.InfoOff,
      isOpen: info,
      name: '회의 세부정보',
      value: 'info',
    },
    {
      icon: chat ? Icon.ChatOn : Icon.ChatOff,
      isOpen: chat,
      name: '모든 사용자와 채팅',
      value: 'chat',
    },
  ];

  const handleButtonClick = (type: 'info' | 'chat') => {
    const { toggleDrawer } = useDrawerStore.getState();
    toggleDrawer(type);
  };

  return (
    <div className='flex items-center justify-self-end'>
      {BUTTON.map(({ icon: IconComponent, isOpen, name, value }, i) => (
        <ButtonTag align={i === BUTTON.length - 1 ? 'right' : 'center'} key={name} name={name}>
          <button
            className='hover:bg-custom-gray flex size-12 items-center justify-center rounded-full'
            type='button'
            onClick={() => handleButtonClick(value)}
          >
            <IconComponent
              className={`${isOpen ? 'fill-device-button-selected-bg' : 'fill-white'}`}
              height={24}
              width={24}
            />
          </button>
        </ButtonTag>
      ))}
    </div>
  );
}
