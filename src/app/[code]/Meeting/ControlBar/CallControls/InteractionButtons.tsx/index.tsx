import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import InteractionButton from './InteractionButton';

import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';
import { useOutsideClick } from '@/hook';
import { cn } from '@/lib/cn';
import { useDrawerStore } from '@/store/useDrawer';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function InteractionButtons() {
  const userId = useUserInfoStore((state) => state.userId);
  const { cc, emoji } = useDrawerStore(
    useShallow((state) => ({
      cc: state.cc,
      emoji: state.emoji,
    })),
  );

  const handsUp = useInteractionStore((state) => state.handsUp);

  const [isOpenOption, setIsOpenOption] = useState<boolean>(false);
  const [active, setActive] = useState<Record<'screenShare', boolean>>({
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
    const { toggleHandsUp } = useInteractionStore.getState();
    if (!userId) {
      return;
    }

    console.log(userId);
    toggleHandsUp(userId);
    handleOptionClose();
  }, [handleOptionClose, userId]);

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
      icon: Icon.Handup,
      isActive: handsUp.has(userId ?? ''),
      name: handsUp ? '손 내리기' : '손들기',
      onClick: handleHandUpButtonClick,
      shortcutKey: ['Control', 'Meta', 'h'],
    },
  ];

  const { targetRef } = useOutsideClick<HTMLDivElement>(handleOptionClose);

  return (
    <div className='relative' ref={targetRef}>
      <div
        className={cn(
          'flex items-center gap-2.5 shadow-xl',
          !isOpenOption && 'max-[850px]:hidden',
          isOpenOption && [
            'max-[850px]:flex-col',
            'max-[850px]:absolute max-[850px]:top-0 max-[850px]:right-1/2',
            'max-[850px]:translate-x-1/2 max-[850px]:-translate-y-[calc(100%+8px)]',
            'max-[850px]:bg-surface-base max-[850px]:w-16 max-[850px]:rounded-lg max-[850px]:p-2',
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
            className='hover:bg-action-hover bg-surface-elevated hidden size-12 items-center justify-center rounded-full max-[850px]:flex'
            type='button'
            onClick={handleOptionButtonClick}
          >
            <Icon.Chevron
              className={cn('fill-on-surface-bright transition-all', !isOpenOption && 'rotate-180')}
              height={12}
              width={12}
            />
          </button>
        </ButtonTag>
      </div>
    </div>
  );
}
