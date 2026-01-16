'use client';

import Meeting from './Meeting';
import PreJoin from './PreJoin';

import { useUserInfoStore } from '@/store/useUserInfoStore';

export default function Page() {
  const userId = useUserInfoStore((state) => state.id);
  return <>{userId ? <Meeting /> : <PreJoin />}</>;
}
