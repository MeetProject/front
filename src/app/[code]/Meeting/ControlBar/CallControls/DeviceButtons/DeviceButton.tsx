'use client';

import { MouseEvent, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import * as Icon from '@/asset/svg';
import { ButtonTag, Visualizer } from '@/components';
import useShortcutKey from '@/hook/useShortcutKey';
import { cn } from '@/lib/cn';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';
import { formatShortcut } from '@/util/formatter';

interface DeviceButtonProps {
  type: 'audio' | 'video';
  isOptionOpen: boolean;
  onChevronClick: () => void;
  shortcutKey?: string[];
  onDisabledClick?: () => void;
  onMute?: (trackType: DeviceKindType) => Promise<void> | void;
}

const BUTTON_PROPS = {
  height: 24,
  width: 24,
};

export default function DeviceButton({
  isOptionOpen,
  onChevronClick,
  onDisabledClick,
  onMute,
  shortcutKey,
  type,
}: DeviceButtonProps) {
  const { deviceEnable, permission, stream } = useDeviceStore(
    useShallow((state) => ({
      deviceEnable: state.deviceEnable,
      permission: state.permission,
      stream: state.stream,
    })),
  );

  const handleMuteButton = useCallback(
    async (e?: MouseEvent) => {
      e?.stopPropagation();

      if (permission[type] !== 'granted') {
        onDisabledClick?.();
        return;
      }

      await onMute?.(type);
    },
    [permission, type, onDisabledClick, onMute],
  );

  useShortcutKey(shortcutKey ?? [], handleMuteButton);

  const enableMute = permission[type] === 'granted';

  const ICON = {
    audio: {
      off: <Icon.MicOff {...BUTTON_PROPS} className='group-hover:fill-error-dark' fill='#5A1410' />,
      on: <Icon.MicOn {...BUTTON_PROPS} className='group-hover:fill-on-surface-bright fill-white' />,
    },
    video: {
      off: <Icon.VideoOff {...BUTTON_PROPS} className='group-hover:fill-error-dark' fill='#5A1410' />,
      on: <Icon.VideoOn {...BUTTON_PROPS} className='group-hover:fill-on-surface-bright fill-white' />,
    },
  };

  const parseShortcut = shortcutKey ? formatShortcut(shortcutKey) : '';
  return (
    <div className='relative'>
      <div className='max-[450px]:hidden'>
        <ButtonTag align='left' name={`${type === 'audio' ? '오디오' : '비디오'} 설정`} position='top'>
          <button
            className={`group h-12 w-22 transition-[border-radius,background-color,transform] duration-200 ease-in-out ${deviceEnable[type] || permission[type] !== 'granted' ? 'bg-surface-elevated hover:bg-action-hover rounded-3xl' : 'bg-error-deep hover:bg-error-dark rounded-xl'} `}
            type='button'
            onClick={onChevronClick}
          >
            <div className='flex size-12 items-center justify-center'>
              {type === 'audio' && enableMute && deviceEnable.audio && (
                <Visualizer className='bg-transparent group-hover:hidden' color='#a8c7fa' source={stream} />
              )}
              <Icon.Chevron
                className={cn(
                  !isOptionOpen && 'rotate-180',
                  type === 'audio' && enableMute && deviceEnable.audio && 'hidden group-hover:inline-block',
                  'fill-white',
                )}
                height={10}
                width={10}
              />
            </div>
          </button>
        </ButtonTag>
      </div>

      <div
        className={cn(
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
            className={cn(
              'group flex size-12 items-center justify-center transition-[border-radius,background-color,transform] duration-200 ease-in-out',
              deviceEnable[type] || permission[type] !== 'granted'
                ? 'bg-state-layer hover:bg-surface-elevated rounded-full'
                : 'bg-error-container hover:bg-error-container rounded-xl',
            )}
            type='button'
            onClick={handleMuteButton}
          >
            {deviceEnable[type] || permission[type] !== 'granted' ? ICON[type].on : ICON[type].off}
          </button>
        </ButtonTag>
        {permission[type] !== 'granted' && (
          <div className='bg-warning-main absolute top-[10%] right-[18%] flex size-3 items-center justify-center rounded-full max-[400px]:size-3'>
            <Icon.Warn height={14} width={14} />
          </div>
        )}
      </div>
    </div>
  );
}
