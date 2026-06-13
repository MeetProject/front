import { useState, useEffect, useRef, ChangeEvent } from 'react';

import CaptureButton from './CaptureButton';
import ConsentNotice from './ConsentNotice';
import SensitiveInfoNotice from './SensitiveInfoNotice';

interface SuggestProperties {
  onComplete: (value: boolean) => void;
  onVisible: (value: boolean) => void;
}

export default function Suggest({ onComplete, onVisible }: SuggestProperties) {
  const textareaReference = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>('');
  const [imgSource, setImgSource] = useState<string | null>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onComplete(e.target.value.length > 2);
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
        <p className='text-surface-base text-sm'>제안사항 설명</p>
        <textarea
          className='text-surface-base placeholder:text-surface-base border-outline-dark min-h-30.5 resize-none overflow-hidden rounded border border-solid p-3.75 outline-none'
          placeholder='제품을 개선하는 데 도움이 될 만한 의견을 알려주세요'
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
