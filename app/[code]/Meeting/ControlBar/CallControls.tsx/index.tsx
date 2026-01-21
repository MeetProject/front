'use client';

import { useState } from 'react';

import DeviceButtons from './DeviceButtons';
import InteractionButtons from './InteractionButtons.tsx';

import { Setting } from '@/components';
import { DeviceKindType } from '@/types/deviceType';

export default function CallControlls() {
  const [isOpenSetting, setIsOpenSetting] = useState<DeviceKindType | null>(null);
  const handleSettingClose = () => {
    setIsOpenSetting(null);
  };
  return (
    <div className='relative flex w-xl items-center gap-2 px-1.5'>
      <DeviceButtons onSettingButtonClick={(category: DeviceKindType) => setIsOpenSetting(category)} />
      <Setting category={isOpenSetting ?? 'audio'} isOpen={isOpenSetting !== null} onClose={handleSettingClose} />
      <InteractionButtons />
    </div>
  );
}
