'use client';

import OverflowTile from './OverflowTile';
import ParticipantTile from './ParticipantTile';
import UserTile from './UserTile';

import { useResizeObserver, useTiledLayout } from '@/hook';
import { cn } from '@/lib/cn';
import { DeviceKindType } from '@/types/deviceType';

interface TiledLayoutProps {
  updateTrackStatus: (userId: string, trackType: DeviceKindType, shouldTrack: boolean) => Promise<void>;
}

export default function TiledLayout({ updateTrackStatus }: TiledLayoutProps) {
  const {
    gridData,
    handleResize,
    layout: { cols, rows, size },
  } = useTiledLayout();

  const { containerRef } = useResizeObserver<HTMLDivElement>(handleResize);

  const lastRowItemCount = gridData.lastRowItemCount || 1;

  const lastRowWrapperStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${lastRowItemCount}, 1fr)`,
    width: `calc((100% + 12px) / ${cols} * ${lastRowItemCount} - 12px)`,
  };

  return (
    <div className='flex size-full shrink flex-col' ref={containerRef}>
      <div
        className='grid size-full min-h-0 min-w-0 justify-center gap-3 transition-all duration-300 ease-in-out'
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        <UserTile />
        {gridData.standardParticipants.map((id) => (
          <ParticipantTile id={id} key={id} updateTrackStatus={updateTrackStatus} />
        ))}

        {gridData.hasOverflowInMainGrid && (
          <OverflowTile count={gridData.overflowCount} user={gridData.overflowUsers} />
        )}

        {gridData.lastRowItemCount > 0 && (
          <div
            className={cn(
              'col-span-full flex h-full w-full items-center justify-center gap-3',
              gridData.isOverflow && size === 1 && 'flex-col',
            )}
          >
            <div className='h-full gap-3' style={lastRowWrapperStyle}>
              {gridData.lastRowParticipants.map((id) => (
                <ParticipantTile id={id} key={id} updateTrackStatus={updateTrackStatus} />
              ))}

              {gridData.isOverflow && !gridData.hasOverflowInMainGrid && (
                <OverflowTile count={gridData.overflowCount} user={gridData.overflowUsers} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
