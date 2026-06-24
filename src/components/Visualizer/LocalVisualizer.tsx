'use client';

import VisualizerContent from './VisualizerContent';

import { useDeviceStore } from '@/store/useDeviceStore';

interface LocalVisualizerProps {
  className?: string;
  color?: string;
}

export default function LocalVisualizer({ className, color }: LocalVisualizerProps) {
  const analyser = useDeviceStore((state) => state.localAnalyser);
  return <VisualizerContent analyser={analyser} className={className} color={color} />;
}
