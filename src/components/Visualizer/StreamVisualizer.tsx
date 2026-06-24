'use client';

import VisualizerContent from './VisualizerContent';

import { useDeviceStore } from '@/store/useDeviceStore';

interface StreamVisualizerProps {
  className?: string;
  color?: string;
}

export default function StreamVisualizer({ className, color }: StreamVisualizerProps) {
  const analyser = useDeviceStore((state) => state.localAnalyser);
  return <VisualizerContent analyser={analyser} className={className} color={color} />;
}
