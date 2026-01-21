'use client';

import * as Icon from '@/asset/svg';

interface OptionProps {
  isFullscreen: boolean;
  onCloseOption: () => void;
  onClickSettingButton: () => void;
  onClickFeedbackButton: () => void;
}

export default function Option({
  isFullscreen,
  onClickFeedbackButton,
  onClickSettingButton,
  onCloseOption,
}: OptionProps) {
  const toggleFullscreen = async () => {
    onCloseOption();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return;
      }
      await document.exitFullscreen();
    } catch {}
  };

  const handleFeedbackButtonClick = () => {
    onCloseOption();
    onClickFeedbackButton();
  };

  const handleSettingButtonClick = () => {
    onCloseOption();
    onClickSettingButton();
  };

  const BUTTON = [
    {
      icon: isFullscreen ? Icon.FullScreenOff : Icon.FullScreen,
      name: isFullscreen ? '전체화면 종료' : '전체화면',
      onClick: toggleFullscreen,
    },
    {
      icon: Icon.Feedback,
      name: '문제 신고',
      onClick: handleFeedbackButtonClick,
    },
    {
      icon: Icon.Setting,
      name: '설정',
      onClick: handleSettingButtonClick,
    },
  ];
  return (
    <div className='absolute top-0 left-0 w-81 -translate-y-[calc(100%+8px)] rounded-xl bg-[#1E1F20] py-2'>
      {BUTTON.map(({ icon: IconComponent, name, onClick }) => (
        <button
          className='flex h-12 w-full items-center gap-4 px-3 py-2 text-white hover:bg-[#2E2F2F] active:bg-[#444545]'
          key={name}
          type='button'
          onClick={onClick}
        >
          <IconComponent fill='#c4c7c5' height={24} width={24} />
          <p>{name}</p>
        </button>
      ))}
    </div>
  );
}
