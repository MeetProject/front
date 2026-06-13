'use client';

import { useEffect, useRef } from 'react';

const MODIFIER_KEYS = ['meta', 'control', 'alt', 'shift'] as const;

const normalizeKey = (key: string) => {
  const lowerKey = key.toLowerCase();
  return lowerKey === 'command' || lowerKey === 'cmd' ? 'meta' : lowerKey;
};

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

const useShortcutKey = (combination: string[], callback: () => void) => {
  const keyPressed = useRef<Record<string, boolean>>({});

  const comboKey = combination.map(normalizeKey).join('+');

  useEffect(() => {
    if (!comboKey) {
      return;
    }

    const requiredKeys = comboKey.split('+');

    const handleKeyDown = (e: KeyboardEvent) => {
      keyPressed.current['meta'] = e.metaKey;
      keyPressed.current['control'] = e.ctrlKey;
      keyPressed.current['alt'] = e.altKey;
      keyPressed.current['shift'] = e.shiftKey;

      const lowerKey = e.key.toLowerCase();
      keyPressed.current[lowerKey] = true;

      if (isEditableTarget(e.target)) {
        return;
      }

      const isCombiPressed = requiredKeys.every((key) => keyPressed.current[key] === true);

      const hasExtraModifier = MODIFIER_KEYS.some(
        (modifier) => !requiredKeys.includes(modifier) && keyPressed.current[modifier],
      );

      if (isCombiPressed && !hasExtraModifier) {
        e.preventDefault();
        callback();
        keyPressed.current[lowerKey] = false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keyPressed.current[e.key.toLowerCase()] = false;

      if (e.key === 'Meta') {
        keyPressed.current = {};
      }
    };

    const handleBlur = () => {
      keyPressed.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [callback, comboKey]);
};

export default useShortcutKey;
