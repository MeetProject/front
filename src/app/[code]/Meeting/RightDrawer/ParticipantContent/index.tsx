'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import RaisedHandsDropDown from './RaisedHandsDropDown';
import UserDropDown from './UserDropDown';

import * as Icon from '@/asset/svg';
import { debounce } from '@/util/debounce';

export default function ParticipantContent() {
  const [keyword, setKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');

  const handleKeywordUpdate = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedKeyword(value);
      }, 200),
    [],
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    handleKeywordUpdate(e.target.value);
  };

  useEffect(
    () => () => {
      handleKeywordUpdate.cancel();
    },
    [handleKeywordUpdate],
  );

  return (
    <div>
      <div className='relative mb-3.75'>
        <input
          aria-label='사용자 검색'
          className='border-outline-light text-on-surface-bright placeholder-on-surface-bright focus:border-primary-container h-12 w-full rounded-lg border px-13 pr-4 outline-2 outline-none focus:border-3'
          placeholder='사용자 검색'
          value={keyword}
          onChange={handleInputChange}
        />
        <Icon.Search className='fill-on-surface-bright absolute top-1/2 left-3 size-6 -translate-y-1/2' />
      </div>
      <div className='text-on-surface-dark my-2.75 px-3.5 text-[11px]'>회의 중</div>
      <div className='flex flex-col justify-center gap-6'>
        <RaisedHandsDropDown keyword={debouncedKeyword} />
        <UserDropDown keyword={debouncedKeyword} />
      </div>
    </div>
  );
}
