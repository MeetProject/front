'use client';

import { useCallback, useState } from 'react';

import { useMediasoup } from './useMediasoup';
import { useSignalingHandler } from './useSignalingHandler';

import { requestJoinRoom } from '@/service/webRtc';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { useWebrtcStore } from '@/store/useWebrtcStore';

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
  const { initSignaling, unsubscribeAll } = useSignalingHandler(consumeTrack, removeConsumer);

  const initWebrtc = useCallback(
    async (roomId: string) => {
      const { initDevice } = useWebrtcStore.getState();
      const device = await initDevice();

      if (!device) {
        return [];
      }

      await Promise.all([createTransport('send'), createTransport('recv'), initSignaling(roomId)]);

      const { stream } = useDeviceStore.getState();
      return Promise.all(
        (stream?.getTracks() ?? []).map((t) => produceTrack(t, t.kind === 'audio' ? 'audio' : 'video')),
      );
    },
    [createTransport, produceTrack, initSignaling],
  );

  const joinRoom = useCallback(
    async (roomId: string) => {
      setIsPending(true);
      const { addParticipant } = useParticipantStore.getState();

      try {
        const produceId = await initWebrtc(roomId);
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
      } catch {
      } finally {
        setIsPending(false);
      }
    },
    [initWebrtc, consumeTrack],
  );

  const leaveRoom = useCallback(() => {
    const { reset } = useParticipantStore.getState();
    unsubscribeAll();
    disconnectTransport();
    reset();
  }, [unsubscribeAll, disconnectTransport]);

  return { isPending, joinRoom, leaveRoom, removeTrack: removeProducer, replaceTrack: replaceProducerTrack };
};

export default useWebrtc;
