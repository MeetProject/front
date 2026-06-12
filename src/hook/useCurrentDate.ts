'use client';

import { useState, useEffect, useRef } from 'react';

const useCurrentDate = () => {
  const [time, setTime] = useState<Date>(new Date());
  const timerReference = useRef<NodeJS.Timeout | null>(null);
  const intervalReference = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentTime = new Date();
    setTime(currentTime);

    const updateTime = () => {
      setTime(new Date());
    };

    timerReference.current = setTimeout(
      () => {
        updateTime();
        intervalReference.current = setInterval(updateTime, 60000);
      },
      60000 - (currentTime.getTime() % 60000),
    );

    return () => {
      if (timerReference.current) {
        clearTimeout(timerReference.current);
      }

      if (intervalReference.current) {
        clearInterval(intervalReference.current);
      }
    };
  }, []);

  return time;
};

export default useCurrentDate;
