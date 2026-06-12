'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';

import { validateRoom } from '@/service/room';
import { register } from '@/service/user';
import { useAlertStore } from '@/store/useAlertStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { UserRegisterPayloadType } from '@/types/userType';
import { getRandomHexColor } from '@/util/color';

const MAX_SIZE = 60;

export default function NameForm() {
  const router = useRouter();
  const { code: sessionId } = useParams<{ code: string }>();

  const [userName, setUserName] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = userName.trim();
    if (!trimmedName) {
      return;
    }

    const { addAlert } = useAlertStore.getState();
    setIsPending(true);
    const userColor = getRandomHexColor();

    const payload: UserRegisterPayloadType = {
      userColor,
      userName: trimmedName,
    };

    try {
      let isValidRoom = false;
      try {
        ({ value: isValidRoom } = await validateRoom(sessionId));
      } catch {
        addAlert('방 정보를 확인하지 못했습니다.');
        return;
      }

      if (!isValidRoom) {
        router.push('/');
        addAlert('이미 닫힌 방입니다.');
        return;
      }

      const { userId } = await register(payload);
      const { setUserInfo } = useUserInfoStore.getState();
      setUserInfo(userId, trimmedName, userColor);
    } catch {
      addAlert('유저 등록에 실패하였습니다.');
    } finally {
      setIsPending(false);
    }
  };

  const handleNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value.slice(0, MAX_SIZE));
  };
  return (
    <form className='flex w-full max-w-75 flex-col items-center justify-center' onSubmit={handleFormSubmit}>
      <div className='font-googleSans w-full pt-5 pb-1.25'>
        <input
          className='border-surface-base h-14 w-full rounded border border-solid px-4 text-base outline-none'
          placeholder='이름'
          value={userName}
          onChange={handleNameInputChange}
        />
        <p className='text-outline-dark w-full px-4 pt-1 text-right text-xs'>{`${userName.length} / ${MAX_SIZE}`}</p>
      </div>
      <button
        className={`mt-4 h-14 w-60 rounded-full ${userName.trim().length ? 'bg-primary-dark text-white' : 'bg-outline-light text-on-surface-disabled'} text-center`}
        disabled={userName.trim().length === 0 || isPending}
        type='submit'
      >
        참여하기
      </button>
    </form>
  );
}
