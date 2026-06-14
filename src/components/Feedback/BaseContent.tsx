'use client';

import Image from 'next/image';
import { MouseEvent } from 'react';

import * as image from '@/asset/image';
import * as Icon from '@/asset/svg';
import { FeedbackCategoryType } from '@/types/components';

interface BaseContentProps {
  onClick: (value: FeedbackCategoryType) => void;
}

interface ButtonType {
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  value: FeedbackCategoryType;
}

const BUTTON: ButtonType[] = [
  { icon: Icon.ReportProblem, name: '문제 신고', value: 'report' },
  { icon: Icon.SuggestIdea, name: '아이디어 제안', value: 'suggest' },
];

export default function BaseContent({ onClick }: BaseContentProps) {
  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>, value: FeedbackCategoryType) => {
    e.stopPropagation();
    onClick(value);
  };

  return (
    <div className='font-googleSans size-full overflow-auto bg-white'>
      <div className='pt-4'>
        <div className='mb-5 flex justify-center'>
          <Image alt='header' height={160} src={image.feedbackHeader} style={{ height: 'auto' }} width={240} />
        </div>
        {BUTTON.map((item) => (
          <button
            className='hover:bg-surface-bright active:bg-state-hover-light flex h-15 w-full items-center gap-2 rounded py-px pr-1.5 pl-5'
            key={item.value}
            type='button'
            onClick={(e) => handleButtonClick(e, item.value)}
          >
            <div className='bg-primary-dark flex size-7 items-center justify-center rounded-full'>
              <item.icon className='fill-white' height={18} width={18} />
            </div>
            <p className='text-outline-dark'>{item.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
