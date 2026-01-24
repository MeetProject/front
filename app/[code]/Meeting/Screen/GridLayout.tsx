'use client';

import clsx from 'clsx';

import { useResponsiveGrid } from '@/hook/useResponsiveGrid';

interface GridLayoutProps {
  participants: string[];
}

export default function GridLayout({ participants }: GridLayoutProps) {
  const {
    containerRef,
    layout: { cols, rows, size },
  } = useResponsiveGrid<HTMLDivElement>(participants.length, 12);

  const last = size % cols;

  return (
    <div className='flex size-full flex-col overflow-hidden' ref={containerRef}>
      <div
        className={clsx('grid size-full justify-center gap-3 transition-all duration-300 ease-in-out')}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {participants.slice(0, size - last).map((id) => (
          <div className='relative flex size-full items-center justify-center' key={id}>
            <div className='aspect-video flex-1 border text-white'>{`test ${id}`}</div>
          </div>
        ))}

        {last > 0 && (
          <div className='flex h-full items-center justify-center gap-3' style={{ gridColumn: `1 / ${cols + 1}` }}>
            {participants.slice(size - (size % cols), size).map((id) => (
              <div className='relative flex size-full items-center justify-center' key={id}>
                <div className='aspect-video flex-1 border text-white'>{`test ${id}`}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
