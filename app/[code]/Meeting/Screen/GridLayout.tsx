'use client';

import clsx from 'clsx';
import { useShallow } from 'zustand/shallow';

import ParticipantTile from './ParticipantTile';
import UserTile from './UserTile';

import { useResponsiveGrid } from '@/hook/useResponsiveGrid';
import { useParticipantStore } from '@/store/useParticipantStore';

const MAX_STREAM_SIZE = 36;

export default function GridLayout() {
  const { info, participants } = useParticipantStore(
    useShallow((state) => ({
      info: state.info,
      participants: state.participants,
    })),
  );
  const participantsSize = Math.min(participants.length, MAX_STREAM_SIZE);
  const {
    containerRef,
    layout: { cols, rows, size },
  } = useResponsiveGrid<HTMLDivElement>(participantsSize, 12);

  const isOverflow = Boolean(size - 1 < participants.length);
  const lastRowIndex = size - cols - (size % cols);

  return (
    <div className='flex size-full flex-col' ref={containerRef}>
      <div
        className={clsx('grid size-full min-h-0 min-w-0 justify-center gap-3 transition-all duration-300 ease-in-out')}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        <UserTile />
        {participants.slice(0, lastRowIndex - 1).map((participant) => (
          <ParticipantTile id={participant} key={participant} />
        ))}
        <div
          className={clsx(
            'col-span-full flex h-full items-center justify-center gap-3',
            isOverflow && size === 1 && 'flex-col',
          )}
        >
          {participants.slice(lastRowIndex - 1, isOverflow ? Math.max(size - 1, 1) : size).map((participant) => (
            <ParticipantTile id={participant} key={participant} />
          ))}

          {isOverflow && size !== 0 && (
            <div className='@container-[size] relative flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden p-1'>
              <div className='h-[min(calc(100cqw/16*9),100%)] max-h-full w-[min(calc(100cqh/9*16),100%)] max-w-full overflow-hidden border border-white'>
                <p className='text-white'>{`${info.get(participants[size - 1]) ?? 'unknown'} 외 ${participants.length - size}명`}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
