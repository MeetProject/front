'use client';

import { useCallback, useState } from 'react';

import DeviceBoxes from './DeviceBoxes';
import DeviceButton from './DeviceButton';

import * as Icon from '@/asset/svg';
import { ButtonTag, MediaPermissionDeniedDialog } from '@/components';
import { useOutsideClick } from '@/hook';
import { DeviceKindType } from '@/types/deviceType';
import { isMac } from '@/util/env';

interface DeviceButtonsProps {
  onSettingButtonClick: (category: DeviceKindType) => void;
}

interface ButtonType {
  type: DeviceKindType;
  shortcutKey: string[];
}

const DEVICE_BUTTONS: ButtonType[] = [
  { shortcutKey: isMac() ? ['Meta', 'd'] : ['Control', 'e'], type: 'audio' },
  { shortcutKey: isMac() ? ['Meta', 'e'] : ['Control', 'e'], type: 'video' },
];

export default function DeviceButtons({ onSettingButtonClick }: DeviceButtonsProps) {
  const [isOpenDeniedDialog, setIsOpenDeniedDialog] = useState<boolean>(false);
  const [deviceOption, setDeviceOption] = useState<DeviceKindType | null>(null);

  const handleChevronClick = useCallback((type?: DeviceKindType) => {
    setDeviceOption((prev) => {
      if (prev !== null) {
        return null;
      }

      return type ?? null;
    });
  }, []);

  const { targetRef } = useOutsideClick<HTMLDivElement>(() => handleChevronClick());

  const handleSettingButtonClose = useCallback(
    (category: DeviceKindType) => {
      onSettingButtonClick(category);
    },
    [onSettingButtonClick],
  );

  const handleDeniedDialogOpen = useCallback(() => {
    setIsOpenDeniedDialog(true);
  }, []);

  return (
    <>
      {deviceOption && (
        <div
          className='absolute -top-2 left-0 flex w-full -translate-y-full items-center gap-2 rounded-[36px] bg-[rgb(44,44,44)] p-2.5'
          ref={targetRef}
        >
          <DeviceBoxes type={deviceOption} onDisabledClick={handleDeniedDialogOpen} />
          <ButtonTag name='설정'>
            <button
              className='flex size-9 items-center justify-center rounded-full transition duration-200 ease-in-out hover:bg-[rgb(256,256,256,0.2)]'
              type='button'
              onClick={() => handleSettingButtonClose(deviceOption)}
            >
              <Icon.Setting fill='#ffffff' height={20} width={20} />
            </button>
          </ButtonTag>
        </div>
      )}
      {DEVICE_BUTTONS.map((button) => (
        <DeviceButton
          isOptionOpen={deviceOption === button.type}
          key={button.type}
          shortcutKey={button.shortcutKey}
          type={button.type}
          onChevronClick={() => handleChevronClick(button.type)}
          onDisabledClick={handleDeniedDialogOpen}
        />
      ))}
      <MediaPermissionDeniedDialog isOpen={isOpenDeniedDialog} onClose={() => setIsOpenDeniedDialog(false)} />
    </>
  );
}
