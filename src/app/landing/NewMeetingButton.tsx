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
      router.push(`/${encodeURIComponent(id)}`);
    } catch {
      const { addAlert } = useAlertStore.getState();
      addAlert('방 생성에 실패하였습니다.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        className='bg-primary-main hover:bg-primary-main-hover flex h-12 shrink-0 items-center justify-center gap-2 rounded-md px-3.5 text-base text-white hover:shadow-md'
        disabled={isPending}
        type='button'
        onClick={handleButtonClick}
      >
        <Icon.AddMeeting className='fill-white' height={18} width={18} />새 회의
      </button>
      <Loading isPending={isPending} />
    </>
  );
}
