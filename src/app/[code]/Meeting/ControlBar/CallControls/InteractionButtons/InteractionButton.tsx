'use client';

import { useCallback, useRef } from 'react';

import { ButtonTag } from '@/components';
import { useShortcutKey } from '@/hook';
import { cn } from '@/lib/cn';
import { formatShortcut } from '@/util/text';

interface InteractionButtonProps {
  name: string;
  isActive: boolean;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  onClick: () => Promise<void> | void;
  shortcutKey?: string[];
}

export default function InteractionButton({
  disabled,
  icon: Icon,
  isActive,
  name,
  onClick,
  shortcutKey = [],
}: InteractionButtonProps) {
  const isClicked = useRef(false);

  const handleClick = useCallback(async () => {
    if (isClicked.current) {
      return;
    }
    isClicked.current = true;
    try {
      await onClick();
    } finally {
      isClicked.current = false;
    }
  }, [onClick]);

  useShortcutKey(shortcutKey, handleClick);

  const formatedShortcut = shortcutKey.length > 0 ? formatShortcut(shortcutKey) : '';
  return (
    <ButtonTag align='center' name={name + formatedShortcut} position='top'>
      <button
        className={cn(
          'flex h-12 w-14 items-center justify-center rounded-3xl transition-[border-radius,background-color,transform] duration-200 ease-in-out',
          isActive && 'bg-primary-container hover:bg-primary-container-hover rounded-xl',
          'max-[850px]:size-14 max-[850px]:rounded-full',
          !isActive && 'bg-surface-elevated hover:bg-action-hover max-[850px]:bg-surface-base',
        )}
        disabled={disabled}
        type='button'
        onClick={handleClick}
      >
        <Icon
          className={cn(isActive ? 'fill-on-primary-container' : 'fill-on-surface-bright')}
          height={24}
          width={24}
        />
      </button>
    </ButtonTag>
  );
}
