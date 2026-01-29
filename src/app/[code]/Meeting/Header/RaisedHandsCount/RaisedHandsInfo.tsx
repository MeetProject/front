'use client';

import { useShallow } from 'zustand/shallow';

import * as Icon from '@/asset/svg';
import { Profile } from '@/components';
import { useParticipantStore } from '@/store/useParticipantStore';

interface RaisedHandsInfoProps {
  onClick: () => void;
}

export default function RaisedHandsInfo({ onClick }: RaisedHandsInfoProps) {
  const { info, isHandsUp } = useParticipantStore(
    useShallow((state) => ({
      info: state.info,
      isHandsUp: state.isHandsUp,
    })),
  );

  return (
    <div className='animate-move-up absolute right-0 bottom-0 z-9999 translate-y-full group-hover:inline-block'>
      <div className='bg-on-surface-light mt-2.5 flex w-79.5 flex-col items-center rounded-xl px-4 py-5 transition-all duration-200'>
        <header className='w-full'>
          <h2 className='text-on-surface-bright text-left'>손을 든 참여자</h2>
        </header>

        <div className='bg-state-layer-light mt-5 w-full rounded-xl px-2 py-2.5 text-left'>
          <p className='text-on-surface-white text-xs'>처음부터 끝까지</p>
          <div className='mt-4 flex w-full flex-col gap-4'>
            {[...isHandsUp.values()].slice(0, 4).map((userId) => (
              <div className='itesm-center flex gap-4' key={userId}>
                <Profile
                  className='size-10'
                  color={info.get(userId)?.color ?? ''}
                  name={info.get(userId)?.name ?? ''}
                />
                <div className='flex flex-1 items-center'>
                  <p className='text-outline-light font-google-sans truncate align-middle'>test</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className='hover:bg-primary-ghost mt-3 rounded-3xl px-7 py-2.5' type='button' onClick={onClick}>
          <div className='flex items-center gap-2'>
            <p className='text-primary-light text-sm'>{`모두 보기(${isHandsUp.size}명)`}</p>
            <Icon.Chevron className='fill-primary-light size-2.5 -rotate-90' />
          </div>
        </button>
      </div>
    </div>
  );
}
