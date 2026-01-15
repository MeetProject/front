'use client';

import { useCallback, useState } from 'react';

import BaseContent from './BaseContent';
import Header from './Header';
import Report from './Report';
import Suggest from './Suggest';

import Dialog from '@/components/_shared/Dialog';

interface FeedbackProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Feedback({ isOpen, onClose }: FeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [category, setCategory] = useState<null | 'report' | 'suggest'>(null);
  const [isCompletedForm, setIsCompletedForm] = useState(false);

  const handleClose = () => {
    setCategory(null);
    onClose();
  };

  const handleVisible = useCallback((value: boolean) => {
    setIsVisible(value);
  }, []);

  return (
    <Dialog
      description='의견이나 문제점을 보내주세요.'
      hidden={!isVisible}
      isOpen={isOpen}
      position='right'
      title='서비스 피드백'
      onClose={handleClose}
    >
      <Header type={category} onClick={setCategory} onClose={handleClose} />
      <div className='flex size-full flex-col'>
        <div className='flex-1 overflow-auto p-4'>
          {category === 'report' ? (
            <Report onComplete={setIsCompletedForm} onVisible={handleVisible} />
          ) : category === 'suggest' ? (
            <Suggest onComplete={setIsCompletedForm} onVisible={handleVisible} />
          ) : (
            <BaseContent onClick={setCategory} />
          )}
        </div>
        {category && (
          <div className='flex justify-end bg-white p-5 pb-4 shadow-[0_-1px_4px_rgba(48,48,48,0.3)]'>
            <button
              className={`font-googleSans h-9 rounded px-6 text-sm transition-colors ${
                isCompletedForm ? 'bg-[#0B57D0] text-white' : 'bg-[#E4E4E4] text-[#555555]'
              }`}
              disabled={!isCompletedForm}
              type='button'
            >
              보내기
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
