'use client';

import { useCallback, useState } from 'react';

import DeviceButtons from './DeviceButtons';
import InteractionButtons from './InteractionButtons.tsx';
import OptionButton from './OptionButton';

import { Feedback, Setting } from '@/components';
import { DeviceKindType } from '@/types/deviceType';

export default function CallControlls() {
  const [isOpenFeedback, setIsOpenFeedback] = useState<boolean>(false);
  const [isOpenSetting, setIsOpenSetting] = useState<DeviceKindType | null>(null);

  const handleSettingOpen = useCallback((category?: DeviceKindType) => {
    setIsOpenSetting(category ?? null);
  }, []);

  const handleFeedbackOpen = useCallback(() => {
    setIsOpenFeedback(true);
  }, []);

  const handleSettingClose = useCallback(() => {
    setIsOpenSetting(null);
  }, []);

  const handleFeedbackClose = useCallback(() => {
    setIsOpenFeedback(false);
  }, []);

  return (
    <div className='relative flex w-xl items-center gap-2 px-1.5'>
      <DeviceButtons onSettingButtonClick={handleSettingOpen} />
      <InteractionButtons />
      <OptionButton onClickFeedbackButton={handleFeedbackOpen} onClickSettingButton={handleSettingOpen} />
      <Setting category={isOpenSetting ?? 'audio'} isOpen={isOpenSetting !== null} onClose={handleSettingClose} />
      <Feedback isOpen={isOpenFeedback} onClose={handleFeedbackClose} />
    </div>
  );
}
