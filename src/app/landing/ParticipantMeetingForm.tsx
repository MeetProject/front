'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useState } from 'react';

import * as Icon from '@/asset/svg';
import { Loading } from '@/components';
import { cn } from '@/lib/cn';
import { validateRoom } from '@/service/room';
import { useAlertStore } from '@/store/useAlertStore';
import { extractRoomCode } from '@/util/text';

export default function ParticipateMeetingForm() {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>('');
  const [isPending, setIsPending] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = extractRoomCode(roomId);
    if (!code) {
      return;
    }
    const { addAlert } = useAlertStore.getState();
    setIsPending(true);
    try {
      const { value: isValid } = await validateRoom(code);

      if (!isValid) {
        addAlert('이미 닫힌 회의방입니다.');
        return;
      }
      router.push(`/${encodeURIComponent(code)}`);
    } catch {
      addAlert('회의 코드를 확인하지 못했습니다. 코드를 다시 확인해주세요.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className='relative flex flex-1 items-center gap-2' onSubmit={handleFormSubmit}>
      <Icon.Keypad className='fill-on-surface-muted absolute top-1/2 left-4 -translate-y-2/4' height={16} width={22} />
      <div className='flex flex-1 items-center'>
        <div className='shrink overflow-hidden'>
          <input
            className='border-on-surface-muted text-surface-elevated outline-primary-main w-full max-w-61.5 shrink rounded border border-solid py-2.75 pr-4 pl-12 text-[16px]'
            placeholder='코드 또는 링크 입력'
            value={roomId}
            onChange={handleInputChange}
          />
        </div>

        <button
          className={cn(
            'shrink-0 rounded px-4 py-3 text-[16px]',
            roomId ? 'text-primary-main' : 'text-outline-strong',
            roomId && 'hover:bg-surface-info',
          )}
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
