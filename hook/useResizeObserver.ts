'use client';

import { debounce } from 'lodash';
import { useEffect, useRef } from 'react';

const useResizeObserver = <T extends HTMLElement>(callback: (width: number, height: number) => void) => {
  const containerRef = useRef<T>(null);
  const lastSize = useRef({ h: 0, w: 0 });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const handleResize = debounce((width: number, height: number) => {
      const [roundedW, roundedH] = [width, height].map((size) => Math.round(size));

      if (lastSize.current.w === roundedW && lastSize.current.h === roundedH) {
        return;
      }

      lastSize.current = { h: roundedH, w: roundedW };
      callback(roundedW, roundedH);
    }, 150);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const { height, width } = entry.contentRect;
      handleResize(width, height);
    });

    observer.observe(containerRef.current);
    const { clientHeight, clientWidth } = containerRef.current;
    handleResize(clientWidth, clientHeight);

    return () => {
      observer.disconnect();
      handleResize.cancel();
    };
  }, [callback, containerRef]);

  return { containerRef };
};

export default useResizeObserver;
