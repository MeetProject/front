'use client';

import { useShallow } from 'zustand/shallow';

import ParticipantTileCluster from './ParticipantTileCluster';

import * as Icon from '@/asset/svg';
import { Profile } from '@/components';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { getTruncatedWords } from '@/util/layout';

interface ParticipantInfoProps {
  onClick: () => void;
}

export default function ParticipantInfo({ onClick }: ParticipantInfoProps) {
  const { userColor, userName } = useUserInfoStore(
    useShallow((state) => ({
      userColor: state.userColor,
      userName: state.userName,
    })),
  );

  const participant = useParticipantStore((state) => state.info);

  const { count, text } = getTruncatedWords(
    [userName ?? '', ...participant.entries().map(([_, { name }]) => name)],
    ' 등',
    150,
  );

  return (
    <div className='animate-move-up absolute right-0 bottom-0 z-9999 translate-y-full group-hover:inline-block'>
      <div className='bg-on-surface-light mt-2.5 flex w-79.5 flex-col items-center rounded-xl px-4 py-5 transition-all duration-200'>
        <header className='w-full'>
          <h2 className='text-on-surface-bright text-left'>사용자</h2>
        </header>
        <button
          className='bg-state-layer-light hover:bg-outline-dark mt-5 w-full rounded-xl px-2 py-2.5'
          type='button'
          onClick={onClick}
        >
          <div className='size-full text-left'>
            <p className='text-on-surface-white text-sm'>{`${participant.size + 1}명 참석`}</p>
            <div className='text-on-surface-dark font-google-sans w-full truncate overflow-hidden text-xs'>
              {`${text} ${participant.size - count + 1}명`}
            </div>
            <div className='mt-3 flex items-center gap-2'>
              <Profile className='size-9 text-sm' color={userColor ?? ''} name={userName ?? ''} />
              {[...participant.entries()].slice(0, 4).map(([id, { color, name }]) => (
                <Profile className='size-9 text-sm' color={color} key={id} name={name} />
              ))}
              {participant.size >= 5 && (
                <ParticipantTileCluster participants={[...participant.entries()].slice(4).map(([_, user]) => user)} />
              )}
            </div>
          </div>
        </button>
        <button className='hover:bg-primary-ghost mt-3 rounded-3xl px-7 py-2.5' type='button' onClick={onClick}>
          <div className='flex items-center gap-2'>
            <p className='text-primary-light text-sm'>통화에 참여중인 모든 사용자 보기</p>
            <Icon.Chevron className='fill-primary-light size-2.5 -rotate-90' />
          </div>
        </button>
      </div>
    </div>
  );
}
