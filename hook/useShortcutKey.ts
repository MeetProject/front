'use client';

import { useEffect, useRef } from 'react';

const useShortcutKey = (combination: string[], callback: () => void) => {
  const keyPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (combination.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keyPressed.current['meta'] = e.metaKey;
      keyPressed.current['control'] = e.ctrlKey;
      keyPressed.current['alt'] = e.altKey;
      keyPressed.current['shift'] = e.shiftKey;

      const lowerKey = e.key.toLowerCase();
      keyPressed.current[lowerKey] = true;

      const isTriggerCombi = combination.every((k) => {
        let targetKey = k.toLowerCase();
        if (targetKey === 'command' || targetKey === 'cmd') targetKey = 'meta';

        return keyPressed.current[targetKey] === true;
      });

      if (isTriggerCombi) {
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
