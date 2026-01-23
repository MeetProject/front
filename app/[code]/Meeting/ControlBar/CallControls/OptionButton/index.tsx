'use client';

import { useCallback, useEffect, useState } from 'react';

import Option from './Option';

import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';
import { useOutsideClick } from '@/hook';

interface OptionButtonProps {
  onClickSettingButton: () => void;
  onClickFeedbackButton: () => void;
}

export default function OptionButton({ onClickFeedbackButton, onClickSettingButton }: OptionButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isClickedButton, setIsClickedButton] = useState(false);

  const handleButtonClick = useCallback(() => {
    setIsClickedButton((previous) => !previous);
  }, []);

  const { targetRef } = useOutsideClick<HTMLDivElement>(() => {
    setIsClickedButton(false);
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className='relative' ref={targetRef}>
      <ButtonTag name='옵션 더보기'>
        <button
          className='bg-device-button-bg hover:bg-device-button-hover-bg flex h-12 w-9 items-center justify-center rounded-full active:bg-[#585A5C]'
          type='button'
          onClick={handleButtonClick}
        >
          <Icon.Menu className='rotate-90' fill='#E3E3E3' height={18} width={18} />
        </button>
      </ButtonTag>
      {isClickedButton && (
        <Option
          isFullscreen={isFullscreen}
          onClickFeedbackButton={onClickFeedbackButton}
          onClickSettingButton={onClickSettingButton}
          onCloseOption={handleButtonClick}
        />
      )}
    </div>
  );
}
