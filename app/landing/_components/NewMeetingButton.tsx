'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import * as Icon from '@/asset/svg';
import Loading from '@/components/Loading';
import { createRoom } from '@/service/room';
import { useAlertStore } from '@/store/useAlertStore';

export default function NewMeetingButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleButtonClick = async () => {
    setIsPending(true);
    try {
      const { roomId: id } = await createRoom();
      router.push(`/${id}`);
    } catch {
      const { addAlert } = useAlertStore.getState();
      setIsPending(false);
      addAlert('방 생성에 실패하였습니다.');
    }
  };

  return (
    <>
      <button
        className='flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#1a73E8] px-3.5 text-base text-white hover:bg-[#1A6DDE] hover:shadow-md'
        disabled={isPending}
        type='button'
        onClick={handleButtonClick}
      >
        <Icon.AddMeeting fill='#ffffff' height={18} width={18} />새 회의
      </button>
      <Loading isPending={isPending} />
    </>
  );
}
