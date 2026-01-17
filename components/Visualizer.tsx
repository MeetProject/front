import { useVolume } from '@/hook';

interface VisualizerProperties {
  stream: MediaStream | null;
}

export default function Visualizer({ stream }: VisualizerProperties) {
  const { volume } = useVolume(stream);

  const getMappedHeight = (val: number) => {
    const THRESHOLD = 3;
    if (val <= 3) {
      return 0;
    }

    const MAX_INPUT = 40;
    const MAX_DISPLAY_HEIGHT = 12;

    const normalized = Math.min((val - THRESHOLD) / (MAX_INPUT - THRESHOLD), 1);
    return Math.pow(normalized, 1.5) * MAX_DISPLAY_HEIGHT;
  };

  const dynamicHeight = getMappedHeight(volume);
  const MIN_HEIGHT = 4;

  return (
    <div
      className='flex size-6.5 items-center justify-center gap-0.5 rounded-full shadow-sm'
      style={{ backgroundColor: 'rgba(26, 115, 232, 0.9)' }}
    >
      <div
        className='w-0.75 rounded-full bg-white transition-[height] duration-75'
        style={{ height: `${MIN_HEIGHT + dynamicHeight / 2}px` }}
      />
      <div
        className='w-0.75 rounded-full bg-white transition-[height] duration-75'
        style={{ height: `${MIN_HEIGHT + dynamicHeight}px` }}
      />
      <div
        className='w-0.75 rounded-full bg-white transition-[height] duration-75'
        style={{ height: `${MIN_HEIGHT + dynamicHeight / 2}px` }}
      />
    </div>
  );
}
