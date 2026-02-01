'use client';

import { partition } from 'lodash';
import { useCallback } from 'react';

import { useEventHandler } from './useEventHandler';
import { useMediasoup } from './useMediasoup';
import { useStomp } from './useStomp';

import { requestJoinRoom } from '@/service/webRtc';
import { useDeviceStore } from '@/store/useDeviceStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { ParticipantDataType } from '@/types/session';

const SERVER_URL = 'http://localhost:8080/ws';

const useWebrtc = () => {
  const { connect, subscribe } = useStomp(SERVER_URL);
  const { consumeTrack, createTransport, initDevice, produceTrack } = useMediasoup();
  const { handleChat, handleEmoji, handleJoinUser, handleToggleDevice, handleToggleHandsUp } = useEventHandler();

  const initWebrtc = useCallback(async () => {
    await initDevice();
    await connect();

    await createTransport('send');
    await createTransport('recv');

    const { stream } = useDeviceStore.getState();

    return Promise.all((stream?.getTracks() ?? []).map((t) => produceTrack(t, t.kind === 'audio' ? 'audio' : 'video')));
  }, [initDevice, connect, createTransport, produceTrack]);

  const processParticipant = useCallback(
    async (data: ParticipantDataType) => {
      const { addParticipant } = useParticipantStore.getState();
      const { produceId: participantProduceId, ...userData } = data;

      type ConsumeResult = Awaited<ReturnType<typeof consumeTrack>>;
      type ValidTrackInfo = NonNullable<ConsumeResult>;

      const results = await Promise.allSettled(participantProduceId.map((id) => consumeTrack(id)));
      const tracksInfo = results
        .filter(
          (res): res is PromiseFulfilledResult<ValidTrackInfo> => res.status === 'fulfilled' && res.value !== null,
        )
        .map((res) => res.value);

      const [screenTracks, userTracks] = partition(tracksInfo, ({ appData }) => appData.kind.includes('screen'));

      if (screenTracks.length > 0) {
        const screenStream = new MediaStream(screenTracks.map((t) => t.track));
        useParticipantStore.setState({ screenStream });
      }

      const userStream = new MediaStream(userTracks.map((t) => t.track));
      addParticipant({ ...userData, stream: userStream });
    },
    [consumeTrack],
  );

  const initSubscribe = useCallback(
    (roomId: string) => {
      subscribe<ParticipantDataType>(`/topic/room/${roomId}/join`, (data) => handleJoinUser(data, processParticipant));
      subscribe(`topic/room/${roomId}/device`, handleToggleDevice);
      subscribe(`topic/room/${roomId}/handsUp`, handleToggleHandsUp);
      subscribe(`topic/room/${roomId}/emoji`, handleEmoji);
      subscribe(`topic/room/${roomId}/chat`, handleChat);
    },
    [subscribe, handleJoinUser, handleChat, handleEmoji, handleToggleDevice, handleToggleHandsUp, processParticipant],
  );

  const joinRoom = useCallback(
    async (roomId: string) => {
      const produceId = await initWebrtc();
      initSubscribe(roomId);

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

      await Promise.all(existingParticipants.map((item) => processParticipant(item)));
    },
    [initSubscribe, initWebrtc, processParticipant],
  );

  return { joinRoom };
};

export default useWebrtc;
