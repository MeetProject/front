'use client';

import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import ParticipantCard from './_shared/ParticipantCard';
import ParticipantDropDown from './_shared/ParticipantDropDown';

import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { UserRegisterPayloadType } from '@/types/userType';
import { charMatcher } from '@/util/matcher';

interface RaisedHandsDropDownProps {
  keyword: string;
}

export default function RaisedHandsDropDown({ keyword }: RaisedHandsDropDownProps) {
  const { userColor, userId, userName } = useUserInfoStore(
    useShallow((state) => ({
      userColor: state.userColor,
      userId: state.userId,
      userName: state.userName,
    })),
  );
  const info = useParticipantStore((state) => state.info);
  const handsUp = useInteractionStore((state) => state.handsUp);

  const handsUpUser = useMemo(() => {
    const matcher = charMatcher(keyword.toLocaleLowerCase());

    return [...handsUp.values()]
      .map((id) => [id, id === userId ? { color: userColor, name: userName ?? '' } : info.get(id)] as const)
      .filter((pair): pair is [string, UserRegisterPayloadType] => {
        const [, userInfo] = pair;
        return userInfo !== undefined && typeof userInfo !== 'string' && matcher.test(userInfo.name);
      });
  }, [handsUp, info, keyword, userId, userName, userColor]);

  if (handsUpUser.length === 0) {
    return null;
  }

  return (
    <ParticipantDropDown name='손을 든 참여자' size={handsUpUser.length}>
      <div className='size-full px-4 py-2'>
        <p className='text-on-surface-dark mb-2 text-xs'>(손 든 순서대로)</p>
        {handsUpUser.map(([id, { color, name }]) => (
          <ParticipantCard color={color} isMe={userId === id} key={userId} name={name} userId={id} />
        ))}
      </div>
    </ParticipantDropDown>
  );
}
