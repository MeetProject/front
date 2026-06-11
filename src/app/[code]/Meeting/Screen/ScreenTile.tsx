'use client';

import { useShallow } from 'zustand/shallow';

import { Media } from '@/components';
import { cn } from '@/lib/cn';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function ScreenTile() {
  const { userId, userName } = useUserInfoStore(
    useShallow((state) => ({
      userId: state.userId,
      userName: state.userName,
    })),
  );
  const { ownerName, screenStream } = useParticipantStore(
    useShallow((state) => ({
      ownerName: state.info.get(state.screenStream.userId ?? '')?.userName,
      screenStream: state.screenStream,
    })),
  );

  const name = screenStream.userId === userId ? userName : ownerName;

  return (
    <div className='@container-[size] relative flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden p-1'>
      <div className='relative size-full max-h-[calc(100cqw*4/3)] max-w-[calc(100cqh*16/9)]'>
        <div className='size-full max-h-full overflow-hidden'>
          <Media
            className='size-full -scale-x-100 rounded-xl'
            muted={screenStream.userId === userId}
            stream={screenStream?.stream ?? undefined}
            tag='video'
          />
        </div>

        <div className={cn('absolute bottom-0 left-0 z-2 px-2 pb-2')}>
          <div className='flex h-8 items-center justify-start gap-2 overflow-hidden rounded-2xl bg-transparent pr-3 pl-2'>
            <div className='shrink'>
              <p className={cn('font-google-sans font-medium', 'text-on-surface-white')}>{name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
