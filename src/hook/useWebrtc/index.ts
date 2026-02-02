'use client';

import { useCallback, useRef, useState } from 'react';

import { useMediasoup } from './useMediasoup';
import { useSignalingHandler } from './useSignalingHandler';

import { requestJoinRoom } from '@/service/webRtc';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { TrackType } from '@/types/deviceType';

const useWebrtc = () => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const {
    consumeTrack,
    createTransport,
    disconnectTransport,
    produceTrack,
    removeConsumer,
    removeProducer,
    replaceProducerTrack,
  } = useMediasoup();
  const { initSignaling, publish, unsubscribeAll } = useSignalingHandler(consumeTrack, removeConsumer);
  const currentRoomId = useRef<string | null>(null);

  const initWebrtc = useCallback(async () => {
    const { initDevice } = useWebrtcStore.getState();
    const device = await initDevice();

    if (!device) {
      return [];
    }

    await Promise.all([createTransport('send'), createTransport('recv')]);

    const { stream } = useDeviceStore.getState();
    return Promise.all((stream?.getTracks() ?? []).map((t) => produceTrack(t, t.kind === 'audio' ? 'audio' : 'video')));
  }, [createTransport, produceTrack]);

  const joinRoom = useCallback(
    async (roomId: string) => {
      setIsPending(true);
      await initSignaling(roomId);
      const { addParticipant } = useParticipantStore.getState();

      try {
        const produceId = await initWebrtc();
        const { userColor, userName } = useUserInfoStore.getState();
        const { deviceEnable } = useDeviceStore.getState();
        if (!userColor || !userName) {
          return;
        }

        const existingParticipants = await requestJoinRoom({
          deviceEnable,
          produceId,
          roomId,
          userColor,
          userName,
        });

        await Promise.all(existingParticipants.map((item) => addParticipant(item, consumeTrack)));
        currentRoomId.current = roomId;
      } catch {
      } finally {
        setIsPending(false);
      }
    },
    [initWebrtc, consumeTrack, initSignaling],
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
