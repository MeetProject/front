'use client';

import Image from 'next/image';
import { MouseEvent } from 'react';

import * as image from '@/asset/image';
import * as Icon from '@/asset/svg';
import { CategoryType } from '@/types/menuType';

interface BaseContentProperties {
  onClick: (value: CategoryType) => void;
}

interface ButtonType {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  value: CategoryType;
}

const BUTTON: ButtonType[] = [
  { icon: Icon.ReportProblem, name: '문제 신고', value: 'report' },
  { icon: Icon.SuggestIdea, name: '아이디어 제안', value: 'suggest' },
];

export default function BaseContent({ onClick }: BaseContentProperties) {
  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>, value: null | 'report' | 'suggest') => {
    e.stopPropagation();
    onClick(value);
  };

  return (
    <div className='font-googleSans size-full overflow-auto bg-white'>
      <div className='pt-4'>
        <div className='mb-5 flex justify-center'>
          <Image alt='header' height={160} src={image.feedbackHeader} width={240} />
        </div>
        {BUTTON.map((button) => {
          const ButtonIcon = button.icon;
          return (
            <button
              className='flex h-15 w-full items-center gap-2 rounded py-px pr-1.5 pl-5 hover:bg-[#F8F8F8] active:bg-[#E8E9E8]'
              key={button.value}
              type='button'
              onClick={(e) => handleButtonClick(e, button.value)}
            >
              <div className='flex size-7 items-center justify-center rounded-full bg-[#0B57D0]'>
                <ButtonIcon fill='#ffffff' height={18} width={18} />
              </div>
              <p className='text-[#444746]'>{button.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
