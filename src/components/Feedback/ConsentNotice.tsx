'use client';

import { useState } from 'react';

import StyleLink from './StyleLink';

import * as Icon from '@/asset/svg';
import { cn } from '@/lib/cn';

export default function ConsentNotice() {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckButtonClick = () => {
    setIsChecked((previous) => !previous);
  };

  return (
    <>
      <div className='flex items-center gap-4 px-1.5 pt-2.5'>
        <button
          className={cn(
            'flex size-4.5 items-center justify-center rounded-sm',
            isChecked ? 'bg-primary-dark' : 'border-on-surface-dark border-2 border-solid',
          )}
          type='button'
          onClick={handleCheckButtonClick}
        >
          <Icon.Check className='fill-white' height={18} width={18} />
        </button>

        <p className='text-outline-dark text-sm'>추가 정보와 최신 소식이 담긴 이메일 전송에 동의</p>
      </div>
      <div className='mt-2'>
        <p className='text-outline-dark text-xs'>
          일부 <StyleLink>계정 및 시스템 정보</StyleLink>가 Google에 전송될 수 있습니다. 이 정보는{' '}
          <StyleLink>개인정보처리방침</StyleLink> 및 <StyleLink>서비스 약관</StyleLink>에 따라 문제를 해결하고 서비스를
          개선하는 데 사용됩니다. 이메일로 추가 정보와 소식을 전달해 드릴 수 있습니다. 법적인 이유로 콘텐츠 변경을
          요청하려면 <StyleLink>법률 정보 고객센터</StyleLink>로 이동하세요.
        </p>
      </div>
    </>
  );
}
