'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useRef } from 'react';

import { ButtonTag } from '@/components';
import { useShortcutKey } from '@/hook';
import { formatShortcut } from '@/util/formatter';

interface InteractionButtonProps {
  name: string;
  isActive: boolean;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  onClick: () => Promise<void> | void;
  autoDeselectDelay?: number;
  shortcutKey?: string[];
}

export default function InteractionButton({
  autoDeselectDelay,
  disabled,
  icon: Icon,
  isActive,
  name,
  onClick,
  shortcutKey = [],
}: InteractionButtonProps) {
  const isClicekd = useRef(false);
  const timerRef = useRef<NodeJS.Timeout>(null);

  useShortcutKey(shortcutKey, onClick);

  const handleClick = useCallback(async () => {
    if (isClicekd.current) {
      return;
    }
    isClicekd.current = true;
    await onClick();
    isClicekd.current = false;
  }, [onClick]);

  useEffect(() => {
    if (!isActive || !autoDeselectDelay) {
      return;
    }

    timerRef.current = setTimeout(() => {
      if (isActive) {
        handleClick();
      }
    }, autoDeselectDelay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive, handleClick, autoDeselectDelay]);

  const formatedShortcut = shortcutKey.length > 0 ? formatShortcut(shortcutKey) : '';
  return (
    <ButtonTag align='center' name={name + formatedShortcut} position='top'>
      <button
        className={clsx(
          'bg-device-button-bg hover:bg-device-button-hover-bg flex h-12 w-14 items-center justify-center rounded-3xl transition-[border-radius,background-color,transform] duration-200 ease-in-out',
          isActive && 'bg-device-button-selected-bg hover:bg-device-button-selected-hover-bg rounded-xl',
          'max-[850px]:size-14 max-[850px]:rounded-full',
          !isActive && 'max-[850px]:bg-device-bg',
        )}
        disabled={disabled}
        type='button'
        onClick={handleClick}
      >
        <Icon
          className={`${isActive ? 'fill-device-button-selected-item' : 'fill-device-button-item'}`}
          height={24}
          width={24}
        />
      </button>
    </ButtonTag>
  );
}
