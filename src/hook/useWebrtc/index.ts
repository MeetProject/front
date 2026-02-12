'use client';

import { RtpCapabilities } from 'mediasoup-client/types';
import { useCallback, useRef, useState } from 'react';

import { useMediasoup } from './useMediasoup';
import { useSignalingHandler } from './useSignalingHandler';

import { useDeviceStore } from '@/store/useDeviceStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';
import { TrackType } from '@/types/deviceType';
import { LeaveResponseType, ParticipantDataType, TrackResponseType } from '@/types/session';

const useWebrtc = () => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const { initSignaling, publish, request, subscribe, unsubscribeAll } = useSignalingHandler();
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

    const routerRtpCapabilities = await request<RtpCapabilities>('/app/request/capability');
    initDevice(routerRtpCapabilities);

    await Promise.all([createTransport('send'), createTransport('recv')]);

    const { stream } = useDeviceStore.getState();
    return Promise.all((stream?.getTracks() ?? []).map((t) => produceTrack(t, t.kind === 'audio' ? 'audio' : 'video')));
  }, [createTransport, produceTrack, request]);

  const joinRoom = useCallback(
    async (roomId: string) => {
      const { addParticipant, addTrack, info } = useParticipantStore.getState();
      setIsPending(true);
      await initSignaling(roomId);
      subscribe(`topic/room/${roomId}/join`, async (participantData: ParticipantDataType) => {
        if (!participantData.id || info.has(participantData.id)) {
          return;
        }
        await addParticipant(participantData, consumeTrack);
      });
      subscribe(`topic/room/${roomId}/track`, async (data: TrackResponseType) => {
        await addTrack(data, consumeTrack);
      });
      subscribe(`topic/room/${roomId}/leave`, async ({ userId }: LeaveResponseType) => {
        const { removeParticipant } = useParticipantStore.getState();
        removeParticipant(userId);
        removeConsumer(userId);
      });

      try {
        const produceId = await initWebrtc();
        const { userColor, userName } = useUserInfoStore.getState();
        const { deviceEnable } = useDeviceStore.getState();
        if (!userColor || !userName) {
          return;
        }

        const existingParticipants = await request<ParticipantDataType[]>('/app/request/join', {
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
    [initWebrtc, consumeTrack, initSignaling, removeConsumer, subscribe, request],
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
