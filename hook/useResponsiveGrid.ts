'use client';

import { debounce } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { calculateGridLayout } from '@/util/layout';

export const useResponsiveGrid = <T extends HTMLElement>(size: number, gap = 0) => {
  const containerRef = useRef<T>(null);
  const lastSize = useRef({ h: 0, w: 0 });

  const [layout, setLayout] = useState({ cols: 1, rows: 1, size: 0 });

  useEffect(() => {
    const calculateLayout = (w: number, h: number) => {
      const roundedW = Math.round(w);
      const roundedH = Math.round(h);

      if (lastSize.current.w === roundedW && lastSize.current.h === roundedH) {
        return;
      }

      const gridLayout = calculateGridLayout(size, roundedW, roundedH, { gap: 12 });

      setLayout(gridLayout);
    };

    const debouncedCalculate = debounce((w: number, h: number) => {
      calculateLayout(w, h);
    }, 150);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const { height, width } = entry.contentRect;
      debouncedCalculate(width, height);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
      const { clientHeight, clientWidth } = containerRef.current;
      calculateLayout(clientWidth, clientHeight);
    }

    return () => {
      observer.disconnect();
      debouncedCalculate.cancel();
    };
  }, [gap, size]);

  return { containerRef, layout };
};
