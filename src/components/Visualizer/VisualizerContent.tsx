'use client';

import { CSSProperties, useRef } from 'react';

import { useVolumeMeter } from '@/hook';
import { mapBarHeight } from '@/util/volume';

interface VisualizerContentProps {
  analyser: AnalyserNode | null;
  className?: string;
  color?: string;
}

export default function VisualizerContent({ analyser, className, color }: VisualizerContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useVolumeMeter(analyser, containerRef, mapBarHeight);

  const barColor = color ? { backgroundColor: color } : {};
  const sideBar: CSSProperties = { height: 'calc(4px + var(--meter, 0) * 0.5px)', ...barColor };
  const centerBar: CSSProperties = { height: 'calc(4px + var(--meter, 0) * 1px)', ...barColor };

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
