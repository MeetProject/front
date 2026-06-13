'use client';

import { useEffect, useRef } from 'react';

const MODIFIER_KEYS = ['meta', 'control', 'alt', 'shift'] as const;

const normalizeKey = (key: string) => {
  const lowerKey = key.toLowerCase();
  return lowerKey === 'command' || lowerKey === 'cmd' ? 'meta' : lowerKey;
};

const useShortcutKey = (combination: string[], callback: () => void) => {
  const keyPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (combination.length === 0) {
      return;
    }

    const requiredKeys = combination.map(normalizeKey);

    const handleKeyDown = (e: KeyboardEvent) => {
      keyPressed.current['meta'] = e.metaKey;
      keyPressed.current['control'] = e.ctrlKey;
      keyPressed.current['alt'] = e.altKey;
      keyPressed.current['shift'] = e.shiftKey;

      const lowerKey = e.key.toLowerCase();
      keyPressed.current[lowerKey] = true;

      const isCombiPressed = requiredKeys.every((key) => keyPressed.current[key] === true);

      // 조합에 없는 modifier가 함께 눌린 경우(예: Ctrl+D 단축키에 Ctrl+Shift+D 입력)는 발동하지 않는다
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
  }, [callback, combination]);
};

export default useShortcutKey;
