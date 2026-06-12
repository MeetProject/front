'use client';

import { useCallback, useRef } from 'react';

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
import { CapabilitiesResponseType, JoinRoomResponseType } from '@/types/session';
import { WS_URL } from '@/util/api';

const useWebrtc = () => {
  const { connect, publish, request, subscribe, unsubscribeAll } = useSignaling(WS_URL);
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
  const joinPromise = useRef<{ promise: Promise<boolean>; roomId: string } | null>(null);

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
    const device = await initDevice(capabilities);

    // device 없이 진행하면 아무것도 송수신하지 못하는 유령 참가자가 되므로 join 실패로 처리
    if (!device) {
      throw new Error('mediasoup device 초기화에 실패했습니다.');
    }

    await Promise.all([createTransport('send'), createTransport('recv')]);

    const { stream } = useDeviceStore.getState();
    return Promise.all((stream?.getTracks() ?? []).map((t) => produceTrack(t, t.kind === 'audio' ? 'audio' : 'video')));
  }, [createTransport, initDevice, produceTrack, request]);

  const cleanupRoomState = useCallback(() => {
    unsubscribeAll();
    disconnectTransport();
    clearDevice();
    useParticipantStore.getState().reset();
    useAudioStore.getState().reset();
    useInteractionStore.getState().reset();
    useLocalMuteStore.getState().reset();
    currentRoomId.current = null;
  }, [unsubscribeAll, disconnectTransport, clearDevice]);

  const executeJoinRoom = useCallback(
    async (roomId: string) => {
      const { addParticipant, addTrack } = useParticipantStore.getState();
      const { deviceEnable } = useDeviceStore.getState();
      const { client } = useSignalStore.getState();

      try {
        if (!client?.connected) {
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

        useInteractionStore.setState({
          handsUp: new Set(participants.filter((item) => item.isHandUp).map(({ user: { userId } }) => userId)),
        });
        currentRoomId.current = roomId;
        return true;
      } catch {
        const { isDisconnected } = useSignalStore.getState();
        cleanupRoomState();
        if (!isDisconnected) {
          useAlertStore.getState().addAlert('회의 참여에 실패하였습니다.');
        }
        return false;
      }
    },
    [consumeTrack, initSubscribe, request, connect, initWebrtc, cleanupRoomState],
  );

  const joinRoom = useCallback(
    (roomId: string) => {
      if (joinPromise.current?.roomId === roomId) {
        return joinPromise.current.promise;
      }

      const promise = executeJoinRoom(roomId).finally(() => {
        if (joinPromise.current?.roomId === roomId) {
          joinPromise.current = null;
        }
      });
      joinPromise.current = { promise, roomId };
      return promise;
    },
    [executeJoinRoom],
  );

  const leaveRoom = useCallback(() => {
    sendLeave();
    cleanupRoomState();
  }, [sendLeave, cleanupRoomState]);

  const shareScreen = useCallback(async () => {
    const { userId } = useUserInfoStore.getState();
    const { screenStream } = useDeviceStore.getState();
    if (!screenStream || !currentRoomId.current || !userId) {
      return;
    }

    await Promise.all(
      screenStream.getTracks().map((track) => produceTrack(track, track.kind === 'audio' ? 'screenAudio' : 'screen')),
    );

    // 다른 사용자의 화면공유를 대체하는 경우 이전 원격 스트림을 정지하고 교체
    const { screenStream: prevScreenStream } = useParticipantStore.getState();
    if (prevScreenStream.stream && prevScreenStream.userId !== userId) {
      prevScreenStream.stream.getTracks().forEach((track) => track.stop());
    }

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

      const removedProducers = removeProducer(trackType);

      if (!removedProducers) {
        return;
      }

      removedProducers.forEach(({ id, trackType: removedTrackType }) => sendProducerRemove(id, removedTrackType));
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
