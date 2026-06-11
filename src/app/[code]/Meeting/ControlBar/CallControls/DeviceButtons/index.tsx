'use client';

import { useCallback, useState } from 'react';

import DeviceBoxes from './DeviceBoxes';
import DeviceButton from './DeviceButton';

import * as Icon from '@/asset/svg';
import { ButtonTag, MediaPermissionDeniedDialog } from '@/components';
import { useDevice, useOutsideClick } from '@/hook';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';
import { isMac } from '@/util/env';

interface DeviceButtonsProps {
  onSettingButtonClick: (category: DeviceKindType) => void;
  onTrackChange?: (trackType: DeviceKindType, track: MediaStreamTrack | null) => Promise<void> | void;
  onTrackMute?: (trackType: DeviceKindType, value?: boolean) => Promise<void> | void;
}

interface ButtonType {
  type: DeviceKindType;
  shortcutKey: string[];
}

const DEVICE_BUTTONS: ButtonType[] = [
  { shortcutKey: isMac() ? ['Meta', 'd'] : ['Control', 'd'], type: 'audio' },
  { shortcutKey: isMac() ? ['Meta', 'e'] : ['Control', 'e'], type: 'video' },
];

export default function DeviceButtons({ onSettingButtonClick, onTrackChange, onTrackMute }: DeviceButtonsProps) {
  const [isOpenDeniedDialog, setIsOpenDeniedDialog] = useState<boolean>(false);
  const [deviceOption, setDeviceOption] = useState<DeviceKindType | null>(null);

  const { toggleVideoTrack } = useDevice();

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

  const handleTrackMuted = useCallback(
    async (trackType: DeviceKindType) => {
      if (!onTrackMute) {
        return;
      }

      const { deviceEnable, toggleDeviceEnable } = useDeviceStore.getState();

      if (trackType === 'video') {
        const newVideoTrack = await toggleVideoTrack();

        if (!deviceEnable[trackType]) {
          await onTrackChange?.(trackType, newVideoTrack);
        }

        await onTrackMute('video', !deviceEnable[trackType]);
        return;
      }

      await onTrackMute(trackType, !deviceEnable[trackType]);
      toggleDeviceEnable(trackType);
    },
    [onTrackMute, onTrackChange, toggleVideoTrack],
  );

  return (
    <>
      {deviceOption && (
        <div
          className='bg-state-dim absolute -top-2 left-0 z-10 flex w-full -translate-y-full items-center gap-2 rounded-[36px] p-2.5'
          ref={targetRef}
        >
          <DeviceBoxes type={deviceOption} onDisabledClick={handleDeniedDialogOpen} onTrackChange={onTrackChange} />
          <ButtonTag name='설정'>
            <button
              className='flex size-9 items-center justify-center rounded-full transition duration-200 ease-in-out hover:bg-[rgba(256,256,256,0.2)]'
              type='button'
              onClick={() => handleSettingButtonClose(deviceOption)}
            >
              <Icon.Setting className='fill-white' height={20} width={20} />
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
          onMute={handleTrackMuted}
        />
      ))}
      <MediaPermissionDeniedDialog isOpen={isOpenDeniedDialog} onClose={() => setIsOpenDeniedDialog(false)} />
    </>
  );
}
