'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';

import { validateRoom } from '@/service/room';
import { register } from '@/service/user';
import { useAlertStore } from '@/store/useAlertStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { UserRegisterPayloadType } from '@/types/userType';
import { getRandomHexColor } from '@/util/random';

const MAX_SIZE = 60;

export default function NameForm() {
  const router = useRouter();
  const sessionId = usePathname().slice(1);

  const [userName, setUserName] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userName) {
      return;
    }

    const { addAlert } = useAlertStore.getState();
    setIsPending(true);
    const userColor = getRandomHexColor();

    const payload: UserRegisterPayloadType = {
      userColor,
      userName,
    };

    try {
      const { userId } = await register(payload);
      const { value } = await validateRoom(sessionId);
      const { setUserInfo } = useUserInfoStore.getState();

      if (!value) {
        router.push('/');
        addAlert('이미 닫힌 방입니다.');
        return;
      }

      setUserInfo(userId, userName, userColor);
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
          className='border-custom-gray h-14 w-full rounded border border-solid px-4 text-base outline-none'
          placeholder='이름'
          value={userName}
          onChange={handleNameInputChange}
        />
        <p className='w-full px-4 pt-1 text-right text-xs text-[#444746]'>{`${userName.length} / ${MAX_SIZE}`}</p>
      </div>
      <button
        className={`mt-4 h-14 w-60 rounded-full ${userName.length ? 'bg-[#0B57D0] text-white' : 'bg-[#E4E4E4] text-[#999999]'} text-center`}
        disabled={userName.length === 0 || isPending}
        type='submit'
      >
        참여하기
      </button>
    </form>
  );
}
