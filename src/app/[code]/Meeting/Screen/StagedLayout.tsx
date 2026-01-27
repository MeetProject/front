'use client';

import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
//import { useShallow } from 'zustand/shallow';

import { useResizeObserver } from '@/hook';
import { PresentationLayoutType } from '@/types/components';
import { calculatePresentationLayout } from '@/util/layout';
//import { useParticipantStore } from '@/store/useParticipantStore';

export default function StagedLayout() {
  const [layout, setLayout] = useState<PresentationLayoutType>({
    mainArea: { height: 0, width: 0 },
    mode: null,
    participantArea: { cols: 0, height: 0, rows: 0, size: 0, width: 0 },
  });

  const participants = useMemo(() => Array.from({ length: 20 }, (_, i) => i), []);

  const handleResize = useCallback(
    (width: number, height: number) => {
      const currentLayout = calculatePresentationLayout(participants.length, width, height, { gap: 12 });
      setLayout(currentLayout);
    },
    [participants],
  );

  const { containerRef } = useResizeObserver<HTMLDivElement>(handleResize);

  const isFull = layout.mode === 'full';
  const isSidebar = layout.mode === 'sidebar';

  const visibleSize = layout.participantArea.size;
  const visibleParticipants = participants.slice(0, visibleSize - 1);
  const remainingCount = participants.length - visibleParticipants.length;
  const hasOverflow = remainingCount > 0;

  const gridStyle = {
    gridTemplateAreas: isSidebar ? '"main side"' : '"side" "main"',
    gridTemplateColumns: isSidebar ? `${layout.mainArea.width}px 1fr` : '1fr',
    gridTemplateRows: isFull ? '1fr' : isSidebar ? '1fr' : `${layout.participantArea.height}px 1fr`,
  };

  return (
    <div className='size-full' ref={containerRef}>
      <div className={clsx('size-full', layout.mode === null && 'hidden')}>
        <div className='grid size-full gap-3 overflow-hidden' style={gridStyle}>
          <section
            className='relative flex items-center justify-center overflow-hidden border border-white shadow-xl'
            style={{ gridArea: 'main' }}
          >
            <div className='flex size-full items-center justify-center border border-white text-white'>screen</div>
          </section>
          {layout.mode !== 'full' && (
            <div
              className='grid gap-3'
              style={{
                gridArea: 'side',
                gridTemplateColumns: `repeat(${layout.participantArea.cols}, 1fr)`,
                gridTemplateRows: `repeat(${layout.participantArea.rows}, 1fr)`,
              }}
            >
              {visibleParticipants.map((el) => (
                <div className='size-full border border-white text-white' key={el}>{`test ${el}`}</div>
              ))}

              {hasOverflow && (
                <div className='size-full border border-white text-white'>{`test ${participants[visibleSize]} 외 ${remainingCount - 1}명`}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
