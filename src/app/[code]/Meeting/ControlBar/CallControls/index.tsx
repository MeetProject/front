'use client';

import { useCallback, useState } from 'react';

import CallEndButton from './CallEndButton';
import DeviceButtons from './DeviceButtons';
import InteractionButtons from './InteractionButtons.tsx';
import OptionButton from './OptionButton';

import { Feedback, Setting } from '@/components';
import { DeviceKindType, TrackType } from '@/types/deviceType';

interface CallControllsProps {
  onTrackChange: (trackType: TrackType, track: MediaStreamTrack | null) => Promise<void>;
  onTrackMute: (trackType: DeviceKindType, value?: boolean) => Promise<void> | void;
  sendHandUp: (value: boolean) => void;
}

export default function CallControlls({ onTrackChange, onTrackMute, sendHandUp }: CallControllsProps) {
  const [isOpenFeedback, setIsOpenFeedback] = useState<boolean>(false);
  const [isOpenSetting, setIsOpenSetting] = useState<DeviceKindType | null>(null);

  const handleSettingOpen = useCallback((category?: DeviceKindType) => {
    setIsOpenSetting(category ?? 'audio');
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
    <div className='relative flex shrink-0 items-center gap-2 px-1.5'>
      <DeviceButtons onSettingButtonClick={handleSettingOpen} onTrackChange={onTrackChange} onTrackMute={onTrackMute} />
      <InteractionButtons sendHandUp={sendHandUp} />
      <OptionButton onClickFeedbackButton={handleFeedbackOpen} onClickSettingButton={handleSettingOpen} />
      <CallEndButton />
      <Setting category={isOpenSetting ?? 'audio'} isOpen={isOpenSetting !== null} onClose={handleSettingClose} />
      <Feedback isOpen={isOpenFeedback} onClose={handleFeedbackClose} />
    </div>
  );
}
