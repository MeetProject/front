import { ChangeEvent, useEffect, useRef, useState } from 'react';

import CaptureButton from './CaptureButton';
import ConsentNotice from './ConsentNotice';
import SensitiveInfoNotice from './SensitiveInfoNotice';

import * as Icon from '@/asset/svg';
import { useOutsideClick } from '@/hook';
import { cn } from '@/lib/cn';

interface ReportProps {
  onComplete: (value: boolean) => void;
  onVisible: (value: boolean) => void;
}

const BUTTON = [
  { name: '회의에 참여하기' },
  { name: '말하기 또는 듣기' },
  { name: '참여자 동영상 보기' },
  { name: '콘텐츠 표시하기' },
  { name: '콘텐츠 보기' },
  { name: '기타' },
];

export default function Report({ onComplete, onVisible }: ReportProps) {
  const textareaReference = useRef<HTMLTextAreaElement>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [option, setOption] = useState<null | string>(null);
  const [text, setText] = useState<string>('');
  const [imgSource, setImgSource] = useState<string | null>(null);

  const handleButtonClick = () => {
    setIsClicked((previous) => !previous);
  };

  const { targetRef } = useOutsideClick<HTMLButtonElement>(() => {
    setIsClicked(false);
  });

  const handleOptionButtonClick = (value: string) => {
    setOption(value);
    setIsClicked(false);
    onComplete(text.length > 2);
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onComplete(e.target.value.length > 2 && Boolean(option));
  };

  const handleImageChange = (value: null | string) => {
    setImgSource(value);
  };

  useEffect(() => {
    if (!textareaReference.current) {
      return;
    }
    textareaReference.current.style.height = 'auto';
    textareaReference.current.style.height = `${textareaReference.current.scrollHeight}px`;
  }, [text]);

  return (
    <div className='font-googleSans flex h-full flex-col gap-5 overflow-auto py-2.5'>
      <div className='flex flex-col gap-2.5'>
        <p className='text-surface-base text-sm'>문제를 발견했을 때 어떤 작업을 시도하고 있었나요?</p>
        <div className='relative'>
          <button
            className='border-outline-dark flex h-14 w-full items-center justify-between rounded border border-solid pr-3 pl-4 outline-none'
            ref={targetRef}
            type='button'
            onClick={handleButtonClick}
          >
            <p className='text-surface-base text-sm'>{option ?? '옵션 선택'}</p>
            <div>
              <Icon.ChevronFill
                className={cn(
                  'fill-primary-dark transition-transform duration-200',
                  isClicked && 'fill-outline-dark rotate-180',
                )}
                height={24}
                width={24}
              />
            </div>
          </button>
          {isClicked && (
            <div
              className='animate-slide-in-bottom absolute top-full left-0 z-30 w-95 origin-top rounded bg-white py-2'
              style={{ boxShadow: 'rgba(48, 48, 48, 0.3) 0px 1px 2px 0px, rgba(48, 48, 48, 0.15) 0px 1px 3px 1px' }}
            >
              {BUTTON.map((button) => (
                <button
                  className='text-surface-base hover:bg-info-subtle h-12 w-full px-4 text-left text-sm'
                  key={button.name}
                  type='button'
                  onClick={() => handleOptionButtonClick(button.name)}
                >
                  {button.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className='flex flex-col gap-2.5'>
        <p className='text-surface-base text-sm'>문제 설명</p>
        <textarea
          className='text-surface-base placeholder:text-surface-base border-outline-dark min-h-30.5 resize-none overflow-hidden rounded border border-solid p-3.75 outline-none'
          placeholder='어떤 문제가 발생했고 작동하지 않는 기능은 무엇인지 알려주세요.'
          ref={textareaReference}
          value={text}
          onChange={handleTextChange}
        />
        <SensitiveInfoNotice />
      </div>
      <CaptureButton imgSrc={imgSource} onImageChange={handleImageChange} onVisible={onVisible} />
      <ConsentNotice />
    </div>
  );
}
