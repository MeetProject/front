'use client';

import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

import * as Icon from '@/asset/svg';
import { useAlertStore } from '@/store/useAlertStore';

export default function InfoContent() {
  const pathname = usePathname();
  const url = window.location.origin + pathname;

  const timerRef = useRef<NodeJS.Timeout>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleClipboardButtonClick = async () => {
    const { addAlert } = useAlertStore.getState();
    try {
      setIsCopied(true);
      await navigator.clipboard.writeText(url);
      if (isCopied) {
        addAlert('회의 링크 복사됨');
      }
    } catch {
      addAlert('회의 링크 복사 실패');
    } finally {
      if (timerRef.current) {
        return;
      }
      timerRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 4000);
    }
  };

  return (
    <div>
      <div className='my-2 pt-2'>
        <p className='font-google-sans text-device-button-item text-sm'>참여 정보</p>
      </div>
      <span className='text-sm text-[rgb(196,199,197)] select-text'>{url}</span>
      <div className='group relative my-1'>
        <button
          className='group-hover:bg-device-button-hover-bg text-device-button-selected-bg h-10 rounded-full pr-4 pl-9.5 text-sm'
          type='button'
          onClick={handleClipboardButtonClick}
        >
          참여 정보 복사
        </button>
        <Icon.Clipboard
          className='fill-device-button-selected-bg group-hover:fill-device-button-selected-hover-bg absolute top-1/2 left-3 -translate-y-1/2'
          height={18}
          width={18}
        />
      </div>
    </div>
  );
}
