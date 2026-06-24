'use client';

import { CSSProperties } from 'react';

import { useVolumeMeter } from '@/hook';
import { mapBarHeight } from '@/util/audio';

interface VisualizerContentProps {
  analyser: AnalyserNode | null;
  className?: string;
  color?: string;
}

export default function VisualizerContent({ analyser, className, color }: VisualizerContentProps) {
  const containerRef = useVolumeMeter<HTMLDivElement>(analyser, mapBarHeight);

  const barColor = color ? { backgroundColor: color } : {};
  const sideBar: CSSProperties = {
    height: '10px',
    transform: 'scaleY(calc((4 + var(--meter, 0) * 0.5) / 10))',
    ...barColor,
  };
  const centerBar: CSSProperties = {
    height: '16px',
    transform: 'scaleY(calc((4 + var(--meter, 0)) / 16))',
    ...barColor,
  };

  return (
    <div
      className={`flex size-6.5 items-center justify-center gap-0.5 rounded-full bg-[rgba(26,115,232,0.9)] shadow-sm ${className}`}
      ref={containerRef}
    >
      <div className='w-0.75 rounded-full bg-white' style={sideBar} />
      <div className='w-0.75 rounded-full bg-white' style={centerBar} />
      <div className='w-0.75 rounded-full bg-white' style={sideBar} />
    </div>
  );
}
