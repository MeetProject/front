'use client';

import { RtpCapabilities } from 'mediasoup-client/types';
import { useCallback, useRef, useState } from 'react';

import { useMediasoup } from './useMediasoup';
import { useSignalingHandler } from './useSignalingHandler';

import { useDeviceStore } from '@/store/useDeviceStore';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { TrackType } from '@/types/deviceType';
import { JoinRoomResponseType } from '@/types/session';

const useWebrtc = () => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const { initSignaling, publish, request, unsubscribeAll } = useSignalingHandler();
  const {
    consumeTrack,
    createTransport,
    disconnectTransport,
    produceTrack,
    removeConsumer,
    removeProducer,
    replaceProducerTrack,
  } = useMediasoup(request);
  const currentRoomId = useRef<string | null>(null);

  const initWebrtc = useCallback(async () => {
    const { device, initDevice, isLoaded } = useWebrtcStore.getState();

    if (isLoaded || device) {
      return;
    }

    const routerRtpCapabilities = await request<RtpCapabilities>('/app/signal/capabilities');
    initDevice(routerRtpCapabilities);

    await Promise.all([createTransport('send'), createTransport('recv')]);

    const { stream } = useDeviceStore.getState();
    return Promise.all((stream?.getTracks() ?? []).map((t) => produceTrack(t, t.kind === 'audio' ? 'audio' : 'video')));
  }, [createTransport, produceTrack, request]);

  const joinRoom = useCallback(
    async (roomId: string) => {
      const { addParticipant } = useParticipantStore.getState();
      setIsPending(true);

      try {
        const produceId = await initWebrtc();
        await initSignaling(roomId, consumeTrack, removeConsumer);

        const { deviceEnable } = useDeviceStore.getState();

        const { participants } = await request<JoinRoomResponseType>('/app/signal/join', {
          mediaOption: deviceEnable,
          producers: produceId,
          roomId,
        });

        await Promise.all(participants.map((item) => addParticipant(item, consumeTrack)));
        useInteractionStore.setState({
          handsUp: new Set(participants.filter((item) => item.isHandUp).map(({ user: { userId } }) => userId)),
        });
        currentRoomId.current = roomId;
      } catch {
      } finally {
        setIsPending(false);
      }
    },
    [initWebrtc, consumeTrack, initSignaling, removeConsumer, request],
  );

  const leaveRoom = useCallback(() => {
    if (!currentRoomId.current) {
      return;
    }
    publish(`/app/room/${currentRoomId.current}/leave`);
    const { reset } = useParticipantStore.getState();
    unsubscribeAll();
    disconnectTransport();
    reset();
  }, [unsubscribeAll, disconnectTransport, publish]);

  const screenShare = useCallback(async () => {
    const { screenStream } = useDeviceStore.getState();
    if (!screenStream || !currentRoomId.current) {
      return;
    }

    const producerId = await Promise.all(
      screenStream
        .getTracks()
        .map(async (track) => await produceTrack(track, track.kind === 'audio' ? 'screenAudio' : 'screenVideo')),
    );

    useParticipantStore.setState({ screenStream: screenStream });
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

  return {
    isPending,
    joinRoom,
    leaveRoom,
    removeTrack,
    replaceTrack: replaceProducerTrack,
    screenShare,
  };
};

export default useWebrtc;
