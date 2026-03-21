'use client';

import { useEffect } from 'react';

import Meeting from './Meeting';
import PreJoin from './PreJoin';

import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';

export default function Page() {
  const userId = useUserInfoStore((state) => state.userId);

  useEffect(() => {
    useWebrtcStore.setState({ isExistRoom: false });
  }, []);
  return <>{userId ? <Meeting /> : <PreJoin />}</>;
}
