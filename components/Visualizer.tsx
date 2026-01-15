import { useVolume } from '@/hook';

interface VisualizerProperties {
  stream: MediaStream | null;
}

export default function Visualizer({ stream }: VisualizerProperties) {
  const { volume } = useVolume(stream);

  const getMappedHeight = (val: number) => {
    if (val <= 0) {
      return 0;
    }
    if (val >= 20) {
      return 12;
    }
    return (val / 20) * 12;
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
