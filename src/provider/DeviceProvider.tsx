'use client';

import { PropsWithChildren } from 'react';

import {
  useAcquireTrackOnPermissionGrant,
  useLocalAnalyser,
  useResumeAudioOnUserGesture,
  useSyncStreamTrackEvents,
  useWatchPermissionChange,
} from '@/hook';

export default function DeviceProvider({ children }: PropsWithChildren) {
  useLocalAnalyser();
  useAcquireTrackOnPermissionGrant();
  useWatchPermissionChange();
  useSyncStreamTrackEvents();
  useResumeAudioOnUserGesture();

  return children;
}
