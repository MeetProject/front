'use client';

import { CSSProperties, ReactNode, useRef, useState } from 'react';

interface ButtonTagProperties {
  children: ReactNode;
  name: string;
  position?: 'top' | 'bottom';
  gap?: number;
  style?: CSSProperties | null;
  align?: 'left' | 'center' | 'right';
  instant?: boolean;
  className?: string;
}

export default function ButtonTag({
  align = 'center',
  children,
  className,
  gap = 4,
  instant,
  name,
  position = 'top',
  style,
}: ButtonTagProperties) {
  const [isDrag, setIsDrag] = useState(false);
  const timerReference = useRef<NodeJS.Timeout | null>(null);

  const positionStyle = position === 'top' ? { top: `calc(-50% - ${gap}px)` } : { bottom: `calc(-50% - ${gap}px)` };

  const handleButtonMouseEnter = () => {
    if (instant) {
      setIsDrag(true);
      return;
    }
    timerReference.current = setTimeout(() => {
      setIsDrag(true);
      timerReference.current = null;
    }, 500);
  };

  const handleButtonMouseLeave = () => {
    if (timerReference.current) {
      clearTimeout(timerReference.current);
      timerReference.current = null;
    }
    setIsDrag(false);
  };

  return (
    <div className='relative' onMouseEnter={handleButtonMouseEnter} onMouseLeave={handleButtonMouseLeave}>
      {children}
      {isDrag && (
        <div
          className={`absolute z-999999 flex h-6 w-max ${align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'} items-center rounded-md bg-[rgb(40,42,44)] px-2 text-xs text-white ${className}`}
          style={{ ...positionStyle, ...style }}
        >
          {name}
        </div>
      )}
    </div>
  );
}
