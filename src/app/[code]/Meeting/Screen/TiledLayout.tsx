'use client';

import clsx from 'clsx';

import OverflowTile from './OverflowTile';
import ParticipantTile from './ParticipantTile';
import UserTile from './UserTile';

import { useResizeObserver, useTiledLayout } from '@/hook';

export default function TiledLayout() {
  const {
    gridData,
    handleResize,
    layout: { cols, rows, size },
  } = useTiledLayout();

  const { containerRef } = useResizeObserver<HTMLDivElement>(handleResize);

  const lastRowWrapperStyle = {
    width: `calc((100% + 12px) / ${cols} * ${gridData?.lastRowItemCount})`,
  };

  return (
    <div className='flex size-full flex-col' ref={containerRef}>
      <div
        className='grid size-full min-h-0 min-w-0 justify-center gap-3 transition-all duration-300 ease-in-out'
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        <UserTile />
        {gridData?.standardParticipants.map((id) => (
          <ParticipantTile id={id} key={id} />
        ))}

        <div
          className={clsx(
            'col-span-full flex h-full items-center justify-center gap-3',
            gridData?.isOverflow && size === 1 && 'flex-col',
          )}
        >
          <div className='flex h-full items-center justify-center gap-3' style={lastRowWrapperStyle}>
            {gridData?.lastRowParticipants.map((id) => (
              <ParticipantTile id={id} key={id} />
            ))}

            {gridData?.isOverflow && <OverflowTile count={gridData?.overflowCount} user={gridData?.overflowUsers} />}
          </div>
        </div>
      </div>
    </div>
  );
}
