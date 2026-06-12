'use client';

import { usePathname } from 'next/navigation';

import * as Icon from '@/asset/svg';
import { useAlertStore } from '@/store/useAlertStore';

export default function InfoContent() {
  const pathname = usePathname();
  const url = typeof window === 'undefined' ? pathname : window.location.origin + pathname;

  const handleClipboardButtonClick = async () => {
    const { addAlert } = useAlertStore.getState();
    try {
      await navigator.clipboard.writeText(url);
      addAlert('회의 링크 복사됨');
    } catch {
      addAlert('회의 링크 복사 실패');
    }
  };

  return (
    <div className='px-4'>
      <div className='my-2 pt-2'>
        <p className='font-google-sans text-on-surface-bright text-sm'>참여 정보</p>
      </div>
      <span className='text-on-surface text-sm select-text'>{url}</span>
      <div className='group relative my-1'>
        <button
          className='group-hover:bg-action-hover text-primary-container h-10 rounded-full pr-4 pl-9.5 text-sm'
          type='button'
          onClick={handleClipboardButtonClick}
        >
          참여 정보 복사
        </button>
        <Icon.Clipboard
          className='fill-primary-container group-hover:fill-primary-container-hover absolute top-1/2 left-3 -translate-y-1/2'
          height={18}
          width={18}
        />
      </div>
    </div>
  );
}
