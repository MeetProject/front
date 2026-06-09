'use client';

import { useCallback, useRef, useState } from 'react';

import { useMediasoup } from './useMediasoup';
import { useSignaling } from './useSignaling';
import { useSignalingHandler } from './useSignalingHandler';
import { useSignalSender } from './useSignalSender';

import { useAudioStore } from '@/store/useAudioStore';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useLocalMuteStore } from '@/store/useLocalMuteStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useSignalStore } from '@/store/useSignalStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { DeviceKindType, TrackType } from '@/types/deviceType';
import { CapabilitiesResponseType, JoinRoomResponseType } from '@/types/session';
import { WS_URL } from '@/util/api';

const useWebrtc = () => {
  const [isPending, setIsPending] = useState<boolean>(false);

  const { connect, publish, request, subscribe, unsubscribeAll } = useSignaling(WS_URL);
  const {
    consumeTrack,
    createTransport,
    disconnectTransport,
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
    const { initDevice } = useWebrtcStore.getState();

    const { capabilities } = await request<CapabilitiesResponseType>('/app/signal/capabilities');
    await initDevice(capabilities);

    await Promise.all([createTransport('send'), createTransport('recv')]);

    const { stream } = useDeviceStore.getState();
    return Promise.all((stream?.getTracks() ?? []).map((t) => produceTrack(t, t.kind === 'audio' ? 'audio' : 'video')));
  }, [createTransport, produceTrack, request]);

  const joinRoom = useCallback(
    async (roomId: string) => {
      const { addParticipant, addTrack } = useParticipantStore.getState();
      const { deviceEnable } = useDeviceStore.getState();
      const { client } = useSignalStore.getState();
      setIsPending(true);

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

        useInteractionStore.setState({
          handsUp: new Set(participants.filter((item) => item.isHandUp).map(({ user: { userId } }) => userId)),
        });
        currentRoomId.current = roomId;
      } catch {
        const { reset } = useParticipantStore.getState();
        const { clearDevice } = useWebrtcStore.getState();
        unsubscribeAll();
        disconnectTransport();
        clearDevice();
        reset();
        currentRoomId.current = null;
      } finally {
        setIsPending(false);
      }
    },
    [consumeTrack, initSubscribe, request, connect, initWebrtc, unsubscribeAll, disconnectTransport],
  );

  const leaveRoom = useCallback(() => {
    sendLeave();
    const { reset } = useParticipantStore.getState();
    const { clearDevice } = useWebrtcStore.getState();
    unsubscribeAll();
    disconnectTransport();
    clearDevice();
    reset();
  }, [unsubscribeAll, disconnectTransport, sendLeave]);

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

  return {
    isPending,
    joinRoom,
    leaveRoom,
    pauseTrack: pauseConsumer,
    removeTrack,
    replaceProducerTrack,
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
