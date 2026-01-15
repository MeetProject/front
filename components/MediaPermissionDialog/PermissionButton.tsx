'use client';

import { JSX, useState } from 'react';

import ButtonTag from '../ButtonTag';

import * as Icon from '@/asset/svg';

interface PermissionButtonProps {
  icon: JSX.Element;
  request: string;
  option: boolean;
}

export default function PermissionButton({ icon, option, request }: PermissionButtonProps) {
  const [isOpenOption, setIsOpenOption] = useState(false);

  const handleOptionButtonClick = () => {
    setIsOpenOption((prev) => !prev);
  };

  return (
    <div className='relative mt-6.25 mb-4 flex flex-1 flex-col items-center justify-center'>
      <div className='flex items-center justify-center'>
        <div className='relative mx-2'>
          <button className='mx-2 flex h-11 min-w-46 items-center justify-center rounded-3xl bg-[#0B57D0] pr-16 pl-24 text-[14px] text-white hover:bg-[#1F64D4] [@media(max-width:600px)]:pr-8 [@media(max-width:600px)]:pl-12 [@media(max-width:600px)]:text-xs'>
            {request}
          </button>
          {icon}
        </div>
        {option && (
          <ButtonTag gap={8} name={isOpenOption ? '옵션 간단히 보기' : '옵션 더보기'} position='top'>
            <button
              className='flex size-10 items-center justify-center rounded-full border hover:bg-gray-300'
              type='button'
              onClick={handleOptionButtonClick}
            >
              <Icon.Chevron
                className={`${isOpenOption && 'rotate-180'} transition-transform duration-300`}
                fill='#444746'
                height={12}
                width={12}
              />
            </button>
          </ButtonTag>
        )}
      </div>
      {isOpenOption && (
        <div className='mt-4 flex items-center justify-center gap-6 [@media(max-width:600px)]:flex-col [@media(max-width:600px)]:gap-3'>
          <div className='relative rounded-3xl border border-[rgb(26,115,232)] hover:bg-blue-50'>
            <button className='flex h-11 items-center justify-center pr-10 pl-16 text-sm text-[rgb(26,115,232)]'>
              마이크 사용
            </button>
            <Icon.Mic
              className='absolute top-1/2 left-10 -translate-y-1/2'
              fill='rgb(26,115,232)'
              height={18}
              width={18}
            />
          </div>
          <div className='relative rounded-3xl border border-[rgb(26,115,232)] hover:bg-blue-50'>
            <button className='flex h-11 items-center justify-center pr-10 pl-16 text-sm text-[rgb(26,115,232)]'>
              카메라 사용
            </button>
            <Icon.VideoOn
              className='absolute top-1/2 left-10 -translate-y-1/2'
              fill='rgb(26,115,232)'
              height={18}
              width={18}
            />
          </div>
        </div>
      )}
    </div>
  );
}
