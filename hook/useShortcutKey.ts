'use client';

import { useEffect, useRef } from 'react';

const useShortcutKey = (combination: string[], callback: () => void) => {
  const keyPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (combination.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keyPressed.current['Meta'] = e.metaKey;
      keyPressed.current['Control'] = e.ctrlKey;
      keyPressed.current['Alt'] = e.altKey;
      keyPressed.current['Shift'] = e.shiftKey;

      keyPressed.current[e.key] = true;

      const isTriggerCombi = combination.every((k) => {
        const targetKey = k === 'Command' || k === 'cmd' ? 'Meta' : k;
        return keyPressed.current[targetKey] === true;
      });

      if (isTriggerCombi) {
        e.preventDefault();
        callback();

        keyPressed.current[e.key] = false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keyPressed.current[e.key] = false;

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
