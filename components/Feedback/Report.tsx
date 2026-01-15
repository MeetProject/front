import { ChangeEvent, useEffect, useRef, useState } from 'react';

import ButtonTag from '../ButtonTag';

import CaptureButton from './CaptureButton';
import StyleLink from './StyleLink';

import * as Icon from '@/asset/svg';
import { useOutsideClick } from '@/hook';

interface ReportProperties {
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

export default function Report({ onComplete, onVisible }: ReportProperties) {
  const textareaReference = useRef<HTMLTextAreaElement>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [option, setOption] = useState<null | string>(null);
  const [text, setText] = useState<string>('');
  const [imgSource, setImgSource] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const handleButtonClick = () => {
    setIsClicked((previous) => !previous);
  };

  const { targetRef } = useOutsideClick<HTMLButtonElement>(() => {
    setIsClicked(false);
  });

  const handleOptionButtonClick = (value: string) => {
    setOption(value);
    if (text.length > 2) {
      onComplete(true);
    } else {
      onComplete(false);
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (e.target.value.length > 2 && option) {
      onComplete(true);
    } else {
      onComplete(false);
    }
  };

  const handleImageChange = (value: null | string) => {
    setImgSource(value);
  };

  const handleCheckButtonClick = () => {
    setIsChecked((previous) => !previous);
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
        <p className='text-custom-gray text-sm'>문제를 발견했을 때 어떤 작업을 시도하고 있었나요?</p>
        <div className='relative'>
          <button
            className='flex h-14 w-full items-center justify-between rounded border border-solid border-[#444746] pr-3 pl-4 outline-none'
            ref={targetRef}
            type='button'
            onClick={handleButtonClick}
          >
            <p className='text-custom-gray text-sm'>{option ?? '옵션 선택'}</p>
            <div>
              <Icon.ChevronFill
                className={`transition-transform duration-200 ${isClicked && 'rotate-180'}`}
                fill={isClicked ? '#0B57D0' : '#444746'}
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
                  className='text-custom-gray h-12 w-full px-4 text-left text-sm hover:bg-[#ECF3FE]'
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
        <p className='text-custom-gray text-sm'>문제 설명</p>
        <textarea
          className='text-custom-gray placeholder:text-custom-gray min-h-30.5 resize-none overflow-hidden rounded border border-solid border-[#444746] p-3.75 outline-none'
          placeholder='어떤 문제가 발생했고 작동자히 않는 기능은 무엇인지 알려주세요.'
          ref={textareaReference}
          value={text}
          onChange={handleTextChange}
        />
        <div className='-mt-0.5 flex items-center gap-2'>
          <p className='text-xs text-[#444746]'>민간함 정보는 포함하지 마세요.</p>
          <ButtonTag
            instant={true}
            name='민감한 정보는 보호되어야 하는 모든 데이터를 의미합니다. 예를 들어 비밀번호, 신용카드 번호, 세부적인 개인 정보를 포함하지 마세요.'
            style={{
              height: '64px',
              left: '-30px',
              padding: '8px',
              top: '100%',
              width: '294px',
            }}
          >
            <Icon.Help className='group' fill='#444746' height={16} width={16} />
          </ButtonTag>
        </div>
      </div>
      <CaptureButton imgSrc={imgSource} onImageChange={handleImageChange} onVisible={onVisible} />
      <div className='flex items-center gap-4 px-1.5 pt-2.5'>
        <button
          className={`flex size-4.5 items-center justify-center rounded-sm ${isChecked ? 'bg-[#0B57D0]' : 'border-2 border-solid border-[#41474B]'}`}
          type='button'
          onClick={handleCheckButtonClick}
        >
          <Icon.Check fill='#ffffff' height={18} width={18} />
        </button>

        <p className='text-sm text-[#444746]'>추가 정보와 최신 소식이 담긴 이메일 전송에 동의</p>
      </div>
      <div className='mt-2'>
        <p className='text-xs text-[#444746]'>
          일부 <StyleLink>계정 및 시스템 정보</StyleLink>가 Google에 전송될 수 있습니다. 이 정보는{' '}
          <StyleLink>개인정보처리방침</StyleLink> 및 <StyleLink>서비스 약관</StyleLink>에 따라 문제를 해결하고 서비스를
          개선하는 데 사용됩니다. 이메일로 추가 정보와 소식을 전달해 드릴 수 있습니다. 법적인 이유로 콘텐츠 변경을
          요청하려면 <StyleLink>법률 정보 고객센터</StyleLink>로 이동하세요.
        </p>
      </div>
    </div>
  );
}
