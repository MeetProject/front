'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';

import * as Icon from '@/asset/svg';
import { Loading } from '@/components';
import { validateRoom } from '@/service/room';
import { useAlertStore } from '@/store/useAlertStore';

export default function ParticipateMeetingForm() {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomId) {
      return;
    }
    setIsPending(true);
    try {
      const { value: isValid } = await validateRoom(roomId);

      if (!isValid) {
        alert('이미 닫힌 회의방입니다.');
        throw new Error('유효하지 않은 id');
      }
      router.push(`/${roomId}`);
    } catch {
      const { addAlert } = useAlertStore.getState();
      addAlert('존재하지 않는 세션입니다.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className='relative flex flex-1 items-center gap-2' onSubmit={handleFormSubmit}>
      <Icon.Keypad className='absolute top-1/2 left-4 -translate-y-2/4' fill='#5F6368' height={16} width={22} />
      <div className='flex flex-1 items-center'>
        <div className='shrink overflow-hidden'>
          <input
            className='w-full max-w-61.5 shrink rounded border border-solid border-[#80868B] py-2.75 pr-4 pl-12 text-[16px] text-[#3C4043] outline-[#1B77E4]'
            placeholder='코드 또는 링크 입력'
            value={roomId}
            onChange={handleInputChange}
          />
        </div>

        <button
          className={`shrink-0 rounded px-4 py-3 text-[16px] ${roomId ? 'text-[#1A73E8]' : 'text-[#B5B6B7]'} ${roomId && 'hover:bg-[#F6FAFE]'}`}
          disabled={!roomId}
          type='submit'
        >
          참여
        </button>
      </div>

      <Loading isPending={isPending} />
    </form>
  );
}
