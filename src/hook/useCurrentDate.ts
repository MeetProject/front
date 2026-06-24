'use client';

import { useState, useEffect, useRef } from 'react';

const useCurrentDate = () => {
  const [time, setTime] = useState<Date>(new Date());
  const timerReference = useRef<NodeJS.Timeout | null>(null);
  const intervalReference = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date());
    };

    const clear = () => {
      if (timerReference.current) {
        clearTimeout(timerReference.current);
      }
      if (intervalReference.current) {
        clearInterval(intervalReference.current);
      }
    };

    const start = () => {
      clear();
      const now = new Date();
      setTime(now);

      timerReference.current = setTimeout(
        () => {
          updateTime();
          intervalReference.current = setInterval(updateTime, 60000);
        },
        60000 - (now.getTime() % 60000),
      );
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clear();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return time;
};

export default useCurrentDate;
