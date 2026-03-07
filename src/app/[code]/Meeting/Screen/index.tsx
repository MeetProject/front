'use client';

import { useShallow } from 'zustand/shallow';

import StagedLayout from './StagedLayout';
import TiledLayout from './TiledLayout';

import { useParticipantStore } from '@/store/useParticipantStore';

export default function Screen() {
  const { screenStream } = useParticipantStore(
    useShallow((state) => ({
      info: state.info,
      screenStream: state.screenStream,
    })),
  );

  if (screenStream && screenStream.stream) {
    return <StagedLayout />;
  }
  return <TiledLayout />;
}
