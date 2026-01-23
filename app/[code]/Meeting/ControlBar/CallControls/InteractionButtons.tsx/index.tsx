import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import InteractionButton from './InteractionButton';

import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';
import { useOutsideClick } from '@/hook';
import { useDrawerStore } from '@/store/useDrawer';

export default function InteractionButtons() {
  const { cc, emoji } = useDrawerStore(
    useShallow((state) => ({
      cc: state.cc,
      emoji: state.emoji,
    })),
  );

  const [isOpenOption, setIsOpenOption] = useState<boolean>(false);
  const [active, setActive] = useState<Record<'handUp' | 'screenShare', boolean>>({
    handUp: false,
    screenShare: false,
  });

  const handleOptionButtonClick = () => {
    setIsOpenOption((prev) => !prev);
  };

  const handleOptionClose = useCallback(() => {
    setIsOpenOption(false);
  }, []);

  const handleScreenShareButtonClick = useCallback(() => {
    setActive((prev) => ({ ...prev, screenShare: !prev.screenShare }));
    handleOptionClose();
  }, [handleOptionClose]);

  const handleEmojiButtonClick = useCallback(() => {
    const { toggleDrawer } = useDrawerStore.getState();
    toggleDrawer('emoji');
    handleOptionClose();
  }, [handleOptionClose]);

  const handleCcButtonClick = useCallback(() => {
    const { toggleDrawer } = useDrawerStore.getState();
    toggleDrawer('cc');
    handleOptionClose();
  }, [handleOptionClose]);

  const handleHandUpButtonClick = useCallback(() => {
    setActive((prev) => ({ ...prev, handUp: !prev.handUp }));
    handleOptionClose();
  }, [handleOptionClose]);

  const BUTTON = [
    {
      icon: Icon.ScreenShare,
      isActive: active.screenShare,
      name: active.screenShare ? '화면 공유 중지' : '화면 공유',
      onClick: handleScreenShareButtonClick,
    },
    { icon: Icon.Emoji, isActive: emoji, name: '반응 보내기', onClick: handleEmojiButtonClick },
    {
      icon: Icon.Cc,
      isActive: cc,
      name: cc ? '자막 사용 중지' : '자막 사용 설정',
      onClick: handleCcButtonClick,
      shortcutKey: ['Shift', 'c'],
    },
    {
      autoDeselectDelay: 4000,
      icon: Icon.Handup,
      isActive: active.handUp,
      name: active.handUp ? '손 내리기' : '손들기',
      onClick: handleHandUpButtonClick,
      shortcutKey: ['Control', 'Meta', 'h'],
    },
  ];

  const { targetRef } = useOutsideClick<HTMLDivElement>(handleOptionClose);

  return (
    <div className='relative' ref={targetRef}>
      <div
        className={clsx(
          'flex items-center gap-2.5',
          !isOpenOption && 'max-[850px]:hidden',
          isOpenOption && [
            'max-[850px]:flex-col',
            'max-[850px]:absolute max-[850px]:top-0 max-[850px]:right-1/2',
            'max-[850px]:translate-x-1/2 max-[850px]:-translate-y-[calc(100%+8px)]',
            'max-[850px]:w-16 max-[850px]:rounded-lg max-[850px]:bg-[rgb(32,33,36)] max-[850px]:p-2 max-[850px]:shadow-xl',
          ],
        )}
      >
        {BUTTON.map((value) => (
          <InteractionButton key={value.name} {...value} />
        ))}
      </div>
      <div className='hidden items-center justify-center max-[850px]:flex'>
        <ButtonTag name='상호작용 더보기'>
          <button
            className='hover:bg-device-button-hover-bg bg-device-button-bg hidden size-12 items-center justify-center rounded-full max-[850px]:flex'
            type='button'
            onClick={handleOptionButtonClick}
          >
            <Icon.Chevron
              className={clsx('fill-device-button-item transition-all', !isOpenOption && 'rotate-180')}
              height={12}
              width={12}
            />
          </button>
        </ButtonTag>
      </div>
    </div>
  );
}
