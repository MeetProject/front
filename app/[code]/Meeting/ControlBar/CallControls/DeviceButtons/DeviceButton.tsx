'use client';

import clsx from 'clsx';
import { MouseEvent, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import * as Icon from '@/asset/svg';
import { ButtonTag, Visualizer } from '@/components';
import { useDevice } from '@/hook';
import useShortcutKey from '@/hook/useShortcutKey';
import { useDeviceStore } from '@/store/useDeviceStore';
import { formatShortcut } from '@/util/formatter';

interface DeviceButtonProps {
  type: 'audio' | 'video';
  isOptionOpen: boolean;
  onChevronClick: () => void;
  shortcutKey?: string[];
  onDisabledClick?: () => void;
}

const BUTTON_PROPS = {
  fill: '#ffffff',
  height: 24,
  width: 24,
};

export default function DeviceButton({
  isOptionOpen,
  onChevronClick,
  onDisabledClick,
  shortcutKey,
  type,
}: DeviceButtonProps) {
  const { toggleAudioTrack, toggleVideoTrack } = useDevice();
  const { deviceEnable, permission, stream } = useDeviceStore(
    useShallow((state) => ({
      deviceEnable: state.deviceEnable,
      permission: state.permission,
      stream: state.stream,
    })),
  );

  const handleMuteButton = useCallback(
    (e?: MouseEvent) => {
      e?.stopPropagation();

      if (permission[type] !== 'granted') {
        onDisabledClick?.();
        return;
      }

      if (type === 'audio') {
        toggleAudioTrack();
        return;
      }

      toggleVideoTrack();
    },
    [toggleAudioTrack, toggleVideoTrack, permission, type, onDisabledClick],
  );

  useShortcutKey(shortcutKey ?? [], handleMuteButton);

  const enableMute = deviceEnable[type] && permission[type] === 'granted';

  const ICON = {
    audio: {
      off: <Icon.MicOff {...BUTTON_PROPS} className='group-hover:fill-[#601410]' fill='#5A1410' />,
      on: <Icon.MicOn {...BUTTON_PROPS} className='group-hover:fill-[#e3e3e3]' />,
    },
    video: {
      off: <Icon.VideoOff {...BUTTON_PROPS} className='group-hover:fill-[#601410]' fill='#5A1410' />,
      on: <Icon.VideoOn {...BUTTON_PROPS} className='group-hover:fill-[#e3e3e3]' />,
    },
  };

  const parseShortcut = shortcutKey ? formatShortcut(shortcutKey) : '';
  return (
    <div className='relative'>
      <div className='max-[450px]:hidden'>
        <ButtonTag align='left' name={`${type === 'audio' ? '오디오' : '비디오'} 설정`} position='top'>
          <button
            className={`group h-12 w-22 transition-[border-radius,background-color,transform] duration-200 ease-in-out ${deviceEnable[type] || permission[type] !== 'granted' ? 'bg-device-button-bg hover:bg-device-button-hover-bg rounded-3xl' : 'rounded-xl bg-[rgb(65,14,11)] hover:bg-[rgb(80,17,14)]'} `}
            type='button'
            onClick={onChevronClick}
          >
            <div className='flex size-12 items-center justify-center'>
              {type === 'audio' && enableMute && (
                <Visualizer className='bg-transparent group-hover:hidden' color='#a8c7fa' stream={stream} />
              )}
              <Icon.Chevron
                className={`${!isOptionOpen && 'rotate-180'} ${type === 'audio' && enableMute && 'hidden group-hover:inline-block'}`}
                fill={enableMute ? '#ffffff' : '#f9dedc'}
                height={10}
                width={10}
              />
            </div>
          </button>
        </ButtonTag>
      </div>

      <div
        className={clsx(
          'absolute top-1/2 right-0 z-1 -translate-y-1/2',
          'max-[450px]:relative max-[450px]:top-0 max-[450px]:translate-0',
        )}
      >
        <ButtonTag
          align='center'
          className={enableMute ? '-translate-x-14' : ''}
          name={
            enableMute
              ? `${type === 'audio' ? '오디오' : '마이크'} ${deviceEnable[type] ? '끄기' : '켜기'}${parseShortcut}`
              : '권한 필요'
          }
          position='top'
        >
          <button
            className={`group flex size-12 items-center justify-center transition-[border-radius,background-color,transform] duration-200 ease-in-out ${deviceEnable[type] || permission[type] !== 'granted' ? 'rounded-full bg-[rgb(51,53,55)] hover:bg-[rgb(60,64,67)]' : 'rounded-xl bg-[rgb(249,222,220)] hover:bg-[rgb(237,210,208)]'} `}
            type='button'
            onClick={handleMuteButton}
          >
            {deviceEnable[type] || permission[type] !== 'granted' ? ICON[type].on : ICON[type].off}
          </button>
        </ButtonTag>
        {permission[type] !== 'granted' && (
          <div className='absolute top-[10%] right-[18%] flex size-3 items-center justify-center rounded-full bg-[rgb(251,188,4)] max-[400px]:size-3'>
            <Icon.Warn height={14} width={14} />
          </div>
        )}
      </div>
    </div>
  );
}
