'use client';

import { CSSProperties } from 'react';

import { useVolumeMeter } from '@/hook';
import { useAudioStore } from '@/store/useAudioStore';
import { useDeviceStore } from '@/store/useDeviceStore';
import { mapBarHeight } from '@/util/audio';

interface VisualizerProps {
  source?: string;
  className?: string;
  color?: string;
}

export default function Visualizer({ className, color, source }: VisualizerProps) {
  const localAnalyser = useDeviceStore((state) => state.localAnalyser);
  const participantAnalyser = useAudioStore((state) => (source ? (state.audio.get(source)?.analyser ?? null) : null));
  const analyser = source ? participantAnalyser : localAnalyser;

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
