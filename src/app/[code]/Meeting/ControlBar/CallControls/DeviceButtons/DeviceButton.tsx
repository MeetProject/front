'use client';

import { MouseEvent, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';

import * as Icon from '@/asset/svg';
import { ButtonTag, LocalVisualizer } from '@/components';
import { useShortcutKey, useSpeakingWhileMuted } from '@/hook';
import { cn } from '@/lib/cn';
import { useDeviceStore } from '@/store/useDeviceStore';
import { DeviceKindType } from '@/types/deviceType';
import { formatShortcut } from '@/util/text';

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
  const { deviceEnable, permission } = useDeviceStore(
    useShallow((state) => ({
      deviceEnable: state.deviceEnable,
      permission: state.permission,
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

  const isSpeakingDetectActive = type === 'audio' && enableMute && !deviceEnable.audio;
  const { dismiss: dismissSpeakingAlert, showAlert: showSpeakingAlert } = useSpeakingWhileMuted(isSpeakingDetectActive);

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
            className={cn(
              'group h-12 w-22 transition-[border-radius,background-color,transform] duration-200 ease-in-out',
              deviceEnable[type] || permission[type] !== 'granted'
                ? 'bg-surface-elevated hover:bg-action-hover rounded-3xl'
                : 'bg-error-deep hover:bg-error-dark rounded-xl',
            )}
            type='button'
            onClick={onChevronClick}
          >
            <div className='flex size-12 items-center justify-center'>
              {type === 'audio' && enableMute && deviceEnable.audio && (
                <LocalVisualizer className='bg-transparent group-hover:hidden' color='#a8c7fa' />
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
        {showSpeakingAlert && (
          <div className='animate-slide-in-bottom bg-state-dim absolute right-0 bottom-full z-20 mb-3 flex items-center gap-1.5 rounded-lg px-3 py-2 whitespace-nowrap shadow-lg'>
            <span className='text-sm font-medium text-white'>혹시 말하고 계시나요?</span>
            <button
              aria-label='안내 닫기'
              className='flex size-4 shrink-0 items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.2)]'
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                dismissSpeakingAlert();
              }}
            >
              <Icon.Delete className='fill-white' height={12} width={12} />
            </button>
          </div>
        )}
        <ButtonTag
          align='center'
          className={cn(enableMute && '-translate-x-14')}
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
