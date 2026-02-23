'use client';

import { useCallback, useRef, useState } from 'react';

import { useMediasoup } from './useMediasoup';
import { useSignaling } from './useSignaling';
import { useSignalingHandler } from './useSignalingHandler';
import { useSignalSender } from './useSignalSender';

import { useDeviceStore } from '@/store/useDeviceStore';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { DeviceKindType, TrackType } from '@/types/deviceType';
import { CapabilitiesResponseType, JoinRoomResponseType } from '@/types/session';

const SERVER_URL = 'http://localhost:8080/ws';

const useWebrtc = () => {
  const [isPending, setIsPending] = useState<boolean>(false);

  const { connect, publish, request, subscribe, unsubscribeAll } = useSignaling(SERVER_URL);
  const {
    consumeTrack,
    createTransport,
    disconnectTransport,
    produceTrack,
    removeConsumer,
    removeProducer,
    replaceProducerTrack,
    toggleProducerTrack,
  } = useMediasoup(request);
  const { initSignaling } = useSignalingHandler(subscribe, consumeTrack, removeConsumer);
  const { sendChat, sendDeviceEnable, sendEmoji, sendHandUp, sendLeave } = useSignalSender(publish);

  const currentRoomId = useRef<string | null>(null);

  const initWebrtc = useCallback(async () => {
    const { device, initDevice, isLoaded } = useWebrtcStore.getState();

    if (isLoaded || device) {
      return;
    }

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
      setIsPending(true);

      try {
        await connect({ onConnect: () => initSignaling(roomId) });
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

        const tracksInfo = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
        tracksInfo.forEach((t) => t && addTrack(t));

        useInteractionStore.setState({
          handsUp: new Set(participants.filter((item) => item.isHandUp).map(({ user: { userId } }) => userId)),
        });
        currentRoomId.current = roomId;
      } catch (e) {
        console.error(e);
      } finally {
        setIsPending(false);
      }
    },
    [consumeTrack, initSignaling, request, connect, initWebrtc],
  );

  const leaveRoom = useCallback(() => {
    if (!currentRoomId.current) {
      return;
    }
    sendLeave();
    const { reset } = useParticipantStore.getState();
    unsubscribeAll();
    disconnectTransport();
    reset();
  }, [unsubscribeAll, disconnectTransport, sendLeave]);

  const screenShare = useCallback(async () => {
    const { userId } = useUserInfoStore.getState();
    const { screenStream } = useDeviceStore.getState();
    if (!screenStream || !currentRoomId.current || !userId) {
      return;
    }

    const producerId = await Promise.all(
      screenStream
        .getTracks()
        .map(async (track) => await produceTrack(track, track.kind === 'audio' ? 'screenAudio' : 'screenVideo')),
    );

    useParticipantStore.setState({ screenStream: new Map([[userId, screenStream]]) });
    publish(`/app/room/${currentRoomId.current}/addTrack`, {
      producerId,
    });
  }, [produceTrack, publish]);

  const removeTrack = useCallback(
    (trackType: TrackType) => {
      if (!currentRoomId.current) {
        return;
      }
      const produceId = removeProducer(trackType);

      if (!produceId) {
        return;
      }
      publish(`/app/room/${currentRoomId.current}/removeTrack`, {
        produceId,
      });
    },
    [removeProducer, publish],
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
    removeTrack,
    replaceProducerTrack,
    replaceTrack: replaceProducerTrack,
    screenShare,
    sendChat,
    sendEmoji,
    sendHandUp,
    toggleTrack,
  };
};

export default useWebrtc;
