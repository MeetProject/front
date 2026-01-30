'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import ParticipantCard from './_shared/ParticipantCard';
import ParticipantDropDown from './_shared/ParticipantDropDown';

import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { charMatcher } from '@/util/matcher';

interface RaisedHandsDropDownProps {
  keyword: string;
}

export default function RaisedHandsDropDown({ keyword }: RaisedHandsDropDownProps) {
  const { userId, userName } = useUserInfoStore(
    useShallow((state) => ({
      userId: state.userId,
      userName: state.userName,
    })),
  );
  const info = useParticipantStore((state) => state.info);
  const handsUp = useInteractionStore((state) => state.handsUp);

  const handsUpUser = useMemo(() => {
    const matcher = charMatcher(keyword.toLocaleLowerCase());
    return [...handsUp.values()]
      .map((id) => [id, (id === userId ? userName : info.get(id)?.name) ?? ''])
      .filter(([_, name]) => matcher.test(name));
  }, [handsUp, info, keyword, userId, userName]);

  if (handsUpUser.length === 0) {
    return null;
  }

  return (
    <ParticipantDropDown name='손을 든 참여자' size={handsUpUser.length}>
      <div className='size-full px-4 py-2'>
        <p className='text-on-surface-dark mb-2 text-xs'>(손 든 순서대로)</p>
        {handsUpUser.map(([id, name]) => (
          <ParticipantCard isMe={userId === id} key={userId} name={name} userId={id} />
        ))}
      </div>
    </ParticipantDropDown>
  );
}
