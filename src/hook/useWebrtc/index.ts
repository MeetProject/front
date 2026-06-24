'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { useMediasoup } from './useMediasoup';
import { useSignaling } from './useSignaling';
import { useSignalingHandler } from './useSignalingHandler';
import { useSignalSender } from './useSignalSender';

import { useAlertStore } from '@/store/useAlertStore';
import { useAudioStore } from '@/store/useAudioStore';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useLocalMuteStore } from '@/store/useLocalMuteStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useSignalStore } from '@/store/useSignalStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { DeviceKindType, TrackType } from '@/types/deviceType';
import {
  CapabilitiesResponseType,
  JoinRoomResponseType,
  ParticipantDataType,
  ResyncResponseType,
} from '@/types/session';
import { WS_URL } from '@/util/api';

const VIDEO_READY_TIMEOUT = 3000;

const waitForTrackUnmute = (track: MediaStreamTrack, timeout: number): Promise<void> =>
  new Promise((resolve) => {
    if (!track.muted) {
      resolve();
      return;
    }

    const cleanup = () => {
      track.removeEventListener('unmute', handleUnmute);
      clearTimeout(timer);
    };
    const handleUnmute = () => {
      cleanup();
      resolve();
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, timeout);

    track.addEventListener('unmute', handleUnmute);
  });

const useWebrtc = () => {
  const router = useRouter();

  const { connect, disconnect, publish, request, subscribe, unsubscribeAll } = useSignaling(WS_URL);
  const {
    clearDevice,
    consumeTrack,
    createTransport,
    disconnectTransport,
    initDevice,
    pauseConsumer,
    produceTrack,
    removeConsumer,
    removeProducer,
    replaceProducerTrack,
    resumeConsumer,
    toggleProducerTrack,
  } = useMediasoup(publish, request);
  const { initSubscribe } = useSignalingHandler(subscribe, consumeTrack, removeConsumer);
  const { sendChat, sendDeviceEnable, sendEmoji, sendHandUp, sendLeave, sendProducerRemove } = useSignalSender(publish);

  const currentRoomId = useRef<string | null>(null);
  const isReattaching = useRef<boolean>(false);

  const toggleParticipantAudio = useCallback(
    (id: string) => {
      const { mute, mutedIds, unmute } = useLocalMuteStore.getState();
      if (mutedIds.has(id)) {
        resumeConsumer(id, 'audio');
        unmute(id);
        return;
      }

      pauseConsumer(id, 'audio');
      mute(id);
    },
    [pauseConsumer, resumeConsumer],
  );

  const initWebrtc = useCallback(async () => {
    const { capabilities } = await request<CapabilitiesResponseType>('/app/signal/capabilities');
    await initDevice(capabilities);

    await Promise.all([createTransport('send'), createTransport('recv')]);

    const { stream } = useDeviceStore.getState();
    return Promise.all((stream?.getTracks() ?? []).map((t) => produceTrack(t, t.kind === 'audio' ? 'audio' : 'video')));
  }, [createTransport, initDevice, produceTrack, request]);

  const joinRoom = useCallback(
    async (roomId: string) => {
      const { addParticipant, addTrack } = useParticipantStore.getState();
      const { deviceEnable } = useDeviceStore.getState();
      const { client } = useSignalStore.getState();

      try {
        if (!client?.active) {
          await connect();
        }

        initSubscribe(roomId);

        const { participants } = await request<JoinRoomResponseType>('/app/signal/join', {
          mediaOption: deviceEnable,
          roomId,
        });

        participants.forEach((participant) => addParticipant(participant));

        await initWebrtc();

        const results = await Promise.allSettled(
          participants.flatMap(({ producerIds, user: { userId } }) =>
            producerIds.map((id) => consumeTrack(userId, id)),
          ),
        );
        const { addAudioTrack } = useAudioStore.getState();
        const tracksInfo = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
        tracksInfo.forEach((t) => {
          if (!t) {
            return;
          }
          if (t.appData.trackType === 'audio') {
            addAudioTrack(t);
            return;
          }
          addTrack(t);
        });

        const videoTracks = tracksInfo.filter((t) => t !== null && t.appData.trackType === 'video');
        await Promise.all(
          videoTracks.map(async (t) => {
            await resumeConsumer(t!.appData.userId, 'video');
            await waitForTrackUnmute(t!.track, VIDEO_READY_TIMEOUT);
          }),
        );

        useInteractionStore.setState({
          handsUp: new Set(participants.filter((item) => item.isHandUp).map(({ user: { userId } }) => userId)),
        });
        currentRoomId.current = roomId;
      } catch {
        const { reset } = useParticipantStore.getState();
        unsubscribeAll();
        disconnectTransport();
        clearDevice();
        reset();
        useAudioStore.getState().reset();
        currentRoomId.current = null;
      }
    },
    [
      consumeTrack,
      initSubscribe,
      request,
      connect,
      initWebrtc,
      unsubscribeAll,
      disconnectTransport,
      clearDevice,
      resumeConsumer,
    ],
  );

  const consumeParticipants = useCallback(
    async (participants: ParticipantDataType[]) => {
      const { userId: selfId } = useUserInfoStore.getState();
      const { addTrack } = useParticipantStore.getState();
      const { addAudioTrack } = useAudioStore.getState();

      const results = await Promise.allSettled(
        participants
          .filter((participant) => participant.user.userId !== selfId)
          .flatMap(({ producerIds, user: { userId } }) => producerIds.map((id) => consumeTrack(userId, id))),
      );

      results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
        .forEach((trackInfo) => {
          if (!trackInfo) {
            return;
          }
          if (trackInfo.appData.trackType === 'audio') {
            addAudioTrack(trackInfo);
            return;
          }
          addTrack(trackInfo);
        });
    },
    [consumeTrack],
  );

  const handleSessionLost = useCallback(() => {
    disconnect();
    useUserInfoStore.setState({ userId: null });
    useAlertStore.getState().addAlert('연결이 끊어져 회의에서 나갔습니다. 다시 입장해 주세요.');
    router.push('/landing');
  }, [disconnect, router]);

  const reattach = useCallback(
    async (roomId: string) => {
      if (isReattaching.current) {
        return;
      }
      isReattaching.current = true;

      try {
        const { participants, rejoinRequired } = await request<ResyncResponseType>('/app/signal/resync', { roomId });

        if (rejoinRequired) {
          handleSessionLost();
          return;
        }

        const { userId: selfId } = useUserInfoStore.getState();
        const { addParticipant, reset } = useParticipantStore.getState();

        disconnectTransport();
        useAudioStore.getState().reset();
        reset();

        initSubscribe(roomId);
        participants
          .filter((participant) => participant.user.userId !== selfId)
          .forEach((participant) => addParticipant(participant));

        await initWebrtc();
        await consumeParticipants(participants);

        useInteractionStore.setState({
          handsUp: new Set(
            participants.filter((participant) => participant.isHandUp).map((participant) => participant.user.userId),
          ),
        });

        currentRoomId.current = roomId;
      } catch {
        handleSessionLost();
      } finally {
        isReattaching.current = false;
      }
    },
    [request, initSubscribe, disconnectTransport, initWebrtc, consumeParticipants, handleSessionLost],
  );

  const leaveRoom = useCallback(() => {
    sendLeave();
    const { reset } = useParticipantStore.getState();
    unsubscribeAll();
    disconnectTransport();
    clearDevice();
    reset();
    useAudioStore.getState().reset();
  }, [unsubscribeAll, disconnectTransport, sendLeave, clearDevice]);

  const shareScreen = useCallback(async () => {
    const { userId } = useUserInfoStore.getState();
    const { screenStream } = useDeviceStore.getState();
    if (!screenStream || !currentRoomId.current || !userId) {
      return;
    }

    await Promise.all(screenStream.getTracks().map(async (track) => await produceTrack(track, 'screen')));

    useParticipantStore.setState({ screenStream: { stream: screenStream, userId } });
  }, [produceTrack]);

  const removeTrack = useCallback(
    (trackType: TrackType) => {
      if (trackType === 'screen') {
        const { userId } = useUserInfoStore.getState();
        if (userId) {
          useParticipantStore.getState().removeTrack(userId, 'screen');
        }
      }

      const produceIds = removeProducer(trackType);

      if (!produceIds) {
        return;
      }

      produceIds.forEach((id) => sendProducerRemove(id, trackType));
    },
    [removeProducer, sendProducerRemove],
  );

  const toggleTrack = useCallback(
    async (trackType: DeviceKindType, value?: boolean) => {
      const { deviceEnable } = useDeviceStore.getState();

      const updatedOption = { ...deviceEnable, [trackType]: value !== undefined ? value : !deviceEnable[trackType] };
      sendDeviceEnable(updatedOption);
      await toggleProducerTrack(trackType, value);
    },
    [sendDeviceEnable, toggleProducerTrack],
  );

  useEffect(() => {
    const prevStatus = { current: useSignalStore.getState().status };

    return useSignalStore.subscribe((state) => {
      const { status } = state;
      if (prevStatus.current === 'reconnecting' && status === 'connected' && currentRoomId.current) {
        reattach(currentRoomId.current);
      }
      prevStatus.current = status;
    });
  }, [reattach]);

  return {
    joinRoom,
    leaveRoom,
    pauseTrack: pauseConsumer,
    removeTrack,
    replaceTrack: replaceProducerTrack,
    resumeTrack: resumeConsumer,
    sendChat,
    sendEmoji,
    sendHandUp,
    shareScreen,
    toggleParticipantAudio,
    toggleTrack,
  };
};

export default useWebrtc;
