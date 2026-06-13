'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Meeting from './Meeting';
import PreJoin from './PreJoin';

import { useAlertStore } from '@/store/useAlertStore';
import { useSignalStore } from '@/store/useSignalStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';

export default function Page() {
  const router = useRouter();
  const userId = useUserInfoStore((state) => state.userId);
  const isDisconnected = useSignalStore((state) => state.isDisconnected);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    useWebrtcStore.setState({ isExitingRoom: false });
    useSignalStore.setState({ isDisconnected: false });
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !isDisconnected) {
      return;
    }

    useAlertStore.getState().addAlert('연결이 끊어져 회의에서 나갑니다.');
    router.push('/');
  }, [ready, isDisconnected, router]);

  if (isDisconnected) {
    return null;
  }

  return <>{userId ? <Meeting /> : <PreJoin />}</>;
}
