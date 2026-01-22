import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import InteractionButton from './InteractionButton';

import * as Icon from '@/asset/svg';
import { useDrawerStore } from '@/store/useDrawer';

export default function InteractionButtons() {
  const { cc, emoji } = useDrawerStore(
    useShallow((state) => ({
      cc: state.cc,
      emoji: state.emoji,
    })),
  );
  const [active, setActive] = useState<Record<'handUp' | 'screenShare', boolean>>({
    handUp: false,
    screenShare: false,
  });

  const handleScreenShareButtonClick = useCallback(() => {
    setActive((prev) => ({ ...prev, screenShare: !prev.screenShare }));
  }, []);

  const handleEmojiButtonClick = useCallback(() => {
    const { toggleDrawer } = useDrawerStore.getState();
    toggleDrawer('emoji');
  }, []);

  const handleCcButtonClick = useCallback(() => {
    const { toggleDrawer } = useDrawerStore.getState();
    toggleDrawer('cc');
  }, []);

  const handleHandUpButtonClick = useCallback(() => {
    setActive((prev) => ({ ...prev, handUp: !prev.handUp }));
  }, []);

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

  return (
    <>
      {BUTTON.map((value) => (
        <InteractionButton key={value.name} {...value} />
      ))}
    </>
  );
}
