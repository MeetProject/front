'use client';

import { MouseEvent } from 'react';

import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';
import { CategoryType } from '@/types/menuType';

interface HeaderProperties {
  type: CategoryType;
  onClick: (value: CategoryType) => void;
  onClose: () => void;
}

export default function Header({ onClick, onClose, type }: HeaderProperties) {
  const handleBackButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick(null);
  };

  const handleCloseButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <header
      className='font-googleSans flex h-15 items-center justify-between gap-2 pt-2 pr-3 pb-1 pl-1'
      style={{ boxShadow: '0 1px 4px rgba(48,48,48,.3)' }}
    >
      <div className='flex w-full items-center'>
        {type && (
          <ButtonTag name='뒤로' position='bottom'>
            <button
              className='flex size-12 items-center justify-center rounded-full hover:bg-[#F8F8F8] active:bg-[#E9E9E9]'
              type='button'
              onClick={handleBackButtonClick}
            >
              <Icon.Arrow fill='#474747' height={24} width={24} />
            </button>
          </ButtonTag>
        )}

        <h1 className='text-custom-gray ml-4 text-lg'>
          {type === 'report' ? '문제 신고' : type === 'suggest' ? '아이디어 제안' : '의견 보내기'}
        </h1>
      </div>
      <ButtonTag name='닫기' position='bottom'>
        <button
          className='flex size-12 items-center justify-center rounded-full hover:bg-[#F8F8F8] active:bg-[#E9E9E9]'
          type='button'
          onClick={handleCloseButtonClick}
        >
          <Icon.Delete fill='#474747' height={24} width={24} />
        </button>
      </ButtonTag>
    </header>
  );
}
