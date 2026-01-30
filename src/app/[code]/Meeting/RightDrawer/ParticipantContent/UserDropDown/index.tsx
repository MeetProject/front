'use client';

import { useCallback, useMemo } from 'react';

import ParticipantCard from '../_shared/ParticipantCard';
import ParticipantDropDown from '../_shared/ParticipantDropDown';

import UserCard from './UserCard';

import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { charMatcher } from '@/util/matcher';

interface UserDropDownProps {
  keyword: string;
}

export default function UserDropDown({ keyword }: UserDropDownProps) {
  const userName = useUserInfoStore((state) => state.userName);
  const info = useParticipantStore((state) => state.info);

  const isMatched = useCallback(
    (value: string) => {
      const matcher = charMatcher(keyword.toLocaleLowerCase());
      return matcher.test(value.toLocaleLowerCase());
    },
    [keyword],
  );

  const isMatchKeyword = useMemo(() => isMatched(userName ?? ''), [isMatched, userName]);
  const filteredUser = useMemo(() => {
    const matcher = charMatcher(keyword.toLocaleLowerCase());
    return [...info.entries()].filter(([_, { name }]) => matcher.test(name.toLocaleLowerCase()));
  }, [info, keyword]);

  const size = filteredUser.length + (isMatchKeyword ? 1 : 0);

  return (
    <ParticipantDropDown name='참여자' size={size}>
      <div className='px-4'>
        {isMatchKeyword && <UserCard />}
        {filteredUser.map(([userId, { name }]) => (
          <ParticipantCard key={userId} name={name} option={{ audio: true }} userId={userId} />
        ))}

        {size === 0 && <div className='text-surface-variant size-full py-2 text-center'>검색결과 없음</div>}
      </div>
    </ParticipantDropDown>
  );
}
