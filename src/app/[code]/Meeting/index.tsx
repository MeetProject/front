'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import BottomDrawer from './BottomDrawer';
import ControlBar from './ControlBar';
import EmojiReaction from './EmojiReaction';
import Header from './Header';
import { ParticipantAudioControlProvider } from './ParticipantAudioControlContext';
import RightDrawer from './RightDrawer';
import Screen from './Screen';

import { Loading } from '@/components';
import { useDevice, useWebrtc } from '@/hook';
import { useAlertStore } from '@/store/useAlertStore';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useDrawerStore } from '@/store/useDrawer';
import { useSignalStore } from '@/store/useSignalStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { TrackType } from '@/types/deviceType';
import { API_URL } from '@/util/api';

export default function Meeting() {
  const router = useRouter();
  const roomId = usePathname().slice(1);
  const isReconnecting = useSignalStore((state) => state.status === 'reconnecting');
  const { initScreenStream, initStream, stopScreenStream, stopStream } = useDevice();
  const { isInit, screenStreams } = useDeviceStore(
    useShallow((state) => ({
      isInit: state.isInit,
      screenStreams: state.screenStream,
    })),
  );

  const {
    joinRoom,
    leaveRoom,
    pauseTrack,
    removeTrack,
    replaceTrack,
    resumeTrack,
    sendChat,
    sendEmoji,
    sendHandUp,
    shareScreen,
    toggleParticipantAudio,
    toggleTrack,
  } = useWebrtc();
  const [isPending, setIsPending] = useState(true);

  const audioControl = useMemo(() => ({ toggleMute: toggleParticipantAudio }), [toggleParticipantAudio]);

  const handleScreenShare = useCallback(async () => {
    const { screenStream } = useDeviceStore.getState();

    if (screenStream) {
      removeTrack('screen');
      stopScreenStream();
      return;
    }
    await initScreenStream(true);
    await shareScreen();
  }, [initScreenStream, shareScreen, removeTrack, stopScreenStream]);

  const handleToggleTrack = useCallback(
    async (userId: string, trackType: TrackType, shouldTrack: boolean) => {
      if (shouldTrack) {
        await resumeTrack(userId, trackType);
        return;
      }

      await pauseTrack(userId, trackType);
    },
    [resumeTrack, pauseTrack],
  );

  useEffect(() => {
    if (!isInit) {
      return;
    }

    const init = async () => {
      await initStream();
      const isJoin = await joinRoom(roomId);

      if (!isJoin) {
        useAlertStore.getState().addAlert('회의 입장에 실패했습니다. 다시 시도해 주세요.');
        router.push('/landing');
        return;
      }

      setIsPending(false);
    };

    init();
  }, [isInit, initStream, joinRoom, roomId, router]);

  useEffect(
    () => () => {
      const { reset } = useDrawerStore.getState();
      stopStream();
      stopScreenStream();
      reset();
      leaveRoom();
    },
    [leaveRoom, stopStream, stopScreenStream],
  );

  useEffect(() => {
    const handleForceLeave = () => {
      const { userId } = useUserInfoStore.getState();
      if (!userId) {
        return;
      }

      const data = new Blob([JSON.stringify({ roomId, userId })], { type: 'application/json' });
      navigator.sendBeacon(`${API_URL}/api/rooms/leave`, data);
    };

    window.addEventListener('beforeunload', handleForceLeave);

    return () => {
      window.removeEventListener('beforeunload', handleForceLeave);
    };
  }, [leaveRoom, roomId]);

  useEffect(() => {
    if (!screenStreams) {
      return;
    }

    const videoTrack = screenStreams.getVideoTracks()[0];
    if (!videoTrack) {
      return;
    }

    videoTrack.onended = () => {
      removeTrack('screen');
      stopScreenStream();
    };

    return () => {
      videoTrack.onended = null;
    };
  }, [screenStreams, removeTrack, stopScreenStream]);

  if (isPending) {
    return <Loading isPending={isPending} />;
  }

  return (
    <ParticipantAudioControlProvider value={audioControl}>
      <div className='bg-surface-deep relative flex h-svh w-svw flex-col overflow-hidden select-none'>
        {isReconnecting && (
          <div className='absolute top-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm text-white'>
            재연결 중…
          </div>
        )}
        <Header />
        <div className='flex flex-1 flex-col'>
          <div className='relative flex flex-1 flex-col'>
            <div className='relative flex flex-1 shrink overflow-hidden px-4'>
              <div className='flex size-full shrink overflow-hidden rounded-[20px]'>
                <Screen updateTrackStatus={handleToggleTrack} />
              </div>
              <RightDrawer sendChat={sendChat} />
            </div>
            <EmojiReaction />
          </div>
          <BottomDrawer sendEmoji={sendEmoji} />
        </div>
        <ControlBar
          sendHandUp={sendHandUp}
          onScreenShare={handleScreenShare}
          onTrackChange={replaceTrack}
          onTrackMute={toggleTrack}
        />
      </div>
    </ParticipantAudioControlProvider>
  );
}
