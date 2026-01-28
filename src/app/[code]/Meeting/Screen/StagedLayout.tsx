'use client';

import clsx from 'clsx';

import OverflowTile from './OverflowTile';
import ParticipantTile from './ParticipantTile';
import UserTile from './UserTile';

import { useResizeObserver, useStagedLayout } from '@/hook';

export default function StagedLayout() {
  const { handleResize, layout, participantData } = useStagedLayout();
  const { containerRef } = useResizeObserver<HTMLDivElement>(handleResize);

  const isFull = layout.mode === 'full';
  const isSidebar = layout.mode === 'sidebar';

  const gridStyle = {
    gridTemplateAreas: isSidebar ? '"main side"' : '"side" "main"',
    gridTemplateColumns: isSidebar ? `${layout.mainArea.width}px 1fr` : '1fr',
    gridTemplateRows: isFull ? '1fr' : isSidebar ? '1fr' : `${layout.participantArea.height}px 1fr`,
  };

  const sideGridStyle = {
    gridArea: 'side',
    gridTemplateColumns: `repeat(${layout.participantArea.cols}, 1fr)`,
    gridTemplateRows: `repeat(${layout.participantArea.rows}, 1fr)`,
  };

  return (
    <div className='size-full' ref={containerRef}>
      <div className={clsx('size-full', layout.mode === null && 'hidden')}>
        <div className='grid size-full gap-3 overflow-hidden' style={gridStyle}>
          <section
            className='relative flex size-full items-center justify-center overflow-hidden border border-white shadow-xl'
            style={{ gridArea: 'main' }}
          >
            <div className='flex size-full items-center justify-center border border-white text-white'>screen</div>
          </section>
          {!isFull && (
            <div className='grid gap-3' style={sideGridStyle}>
              <UserTile />
              {participantData?.visible.map((id) => (
                <ParticipantTile id={id} key={id} />
              ))}

              {participantData?.hasOverflow && (
                <OverflowTile count={participantData?.remainingCount} user={participantData?.overflowUsers} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
