import { useCallback, useState } from 'react';

import InteractionButton from './InteractionButton';

import * as Icon from '@/asset/svg';

export default function InteractionButtons() {
  const [active, setActive] = useState<Record<'cc' | 'emoji' | 'handUp' | 'screenShare', boolean>>({
    cc: false,
    emoji: false,
    handUp: false,
    screenShare: false,
  });

  const handleScreenShareButtonClick = useCallback(() => {
    setActive((prev) => ({ ...prev, screenShare: !prev.screenShare }));
  }, []);

  const handleEmojiButtonClick = useCallback(() => {
    setActive((prev) => ({ ...prev, emoji: !prev.emoji }));
  }, []);

  const handleCcButtonClick = useCallback(() => {
    setActive((prev) => ({ ...prev, cc: !prev.cc }));
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
    { icon: Icon.Emoji, isActive: active.emoji, name: '반응 보내기', onClick: handleEmojiButtonClick },
    {
      icon: Icon.Cc,
      isActive: active.cc,
      name: active.cc ? '자막 사용 중지' : '자막 사용 설정',
      onClick: handleCcButtonClick,
      shortcutKey: ['Shift', 'c'],
    },
    {
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
