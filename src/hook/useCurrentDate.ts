'use client';

import { useState, useEffect, useRef } from 'react';

const useCurrentDate = () => {
  // 정적 프리렌더 시 빌드 시점 시간이 HTML에 박혀 hydration 불일치가 나지 않도록 마운트 후에 시간을 설정
  const [time, setTime] = useState<Date | null>(null);
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
