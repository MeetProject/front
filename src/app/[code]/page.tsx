'use client';

import { useEffect } from 'react';

import Meeting from './Meeting';
import PreJoin from './PreJoin';

import { useSignalStore } from '@/store/useSignalStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';

export default function Page() {
  const userId = useUserInfoStore((state) => state.userId);

  useEffect(() => {
    useWebrtcStore.setState({ isExitingRoom: false });
    useSignalStore.setState({ isDisconnected: false });
  }, []);
  return <>{userId ? <Meeting /> : <PreJoin />}</>;
}
