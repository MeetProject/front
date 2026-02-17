'use client';

import { StompConfig } from '@stomp/stompjs';
import { useCallback } from 'react';

import { useSignaling } from './useSignaling';

import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import {
  ChatResponseType,
  EmojiResponseType,
  LeaveResponseType,
  ParticipantDataType,
  ToggleDeviceEnalbeResponseType,
  ToggleHandsUpResponseType,
  TrackResponseType,
} from '@/types/session';
import { AppData } from '@/types/webRtc';

const SERVER_URL = 'http://localhost:8080/ws';

export const useSignalingHandler = () => {
  const { connect, disconnect, publish, request, subscribe, unsubscribeAll } = useSignaling(SERVER_URL);

  const handleToggleDevice = useCallback(async (data: ToggleDeviceEnalbeResponseType) => {
    const { toggleDevices } = useParticipantStore.getState();
    const { deviceType, userId } = data;
    toggleDevices(userId, deviceType);
  }, []);

  const handleToggleHandsUp = useCallback(async (data: ToggleHandsUpResponseType) => {
    const { toggleHandsUp } = useInteractionStore.getState();
    const { userId } = data;
    toggleHandsUp(userId);
  }, []);

  const handleEmoji = useCallback(async (data: EmojiResponseType) => {
    const { addEmoji } = useInteractionStore.getState();
    const { addEmoji: addEmojiStatus } = useParticipantStore.getState();
    const { id, ...emojiData } = data;

    addEmoji(id, data);
    addEmojiStatus(emojiData.userId, emojiData.emoji);
  }, []);

  const handleChat = useCallback(async (data: ChatResponseType) => {
    const { addChat } = useParticipantStore.getState();
    addChat(data);
  }, []);

  const handleParticipant = useCallback(
    async (
      data: ParticipantDataType,
      consumeTrack: (producerId: string) => Promise<{
        appData: AppData;
        track: MediaStreamTrack;
      } | null>,
    ) => {
      const { addParticipant } = useParticipantStore.getState();
      addParticipant(data, consumeTrack);
    },
    [],
  );

  const handleConsumeTrack = useCallback(
    async (
      data: TrackResponseType,
      consumeTrack: (producerId: string) => Promise<{
        appData: AppData;
        track: MediaStreamTrack;
      } | null>,
    ) => {
      const { addTrack } = useParticipantStore.getState();
      await addTrack(data.produceId, consumeTrack);
    },
    [],
  );

  const handleLeave = useCallback(async ({ userId }: LeaveResponseType, removeConsumer: (userId: string) => void) => {
    const { removeParticipant } = useParticipantStore.getState();
    removeParticipant(userId);
    removeConsumer(userId);
  }, []);

  const initSignaling = useCallback(
    async (
      roomId: string,
      consumeTrack: (producerId: string) => Promise<{
        appData: AppData;
        track: MediaStreamTrack;
      } | null>,
      removeConsumer: (userId: string) => void,
      config?: StompConfig,
    ) => {
      await connect(config);

      subscribe(`topic/room/${roomId}/participant`, (data: ParticipantDataType) =>
        handleParticipant(data, consumeTrack),
      );
      subscribe(`topic/room/${roomId}/track`, (data: TrackResponseType) => handleConsumeTrack(data, consumeTrack));
      subscribe(`topic/room/${roomId}/leave`, (data: LeaveResponseType) => handleLeave(data, removeConsumer));

      subscribe(`topic/room/${roomId}/device`, handleToggleDevice);
      subscribe(`topic/room/${roomId}/handsUp`, handleToggleHandsUp);
      subscribe(`topic/room/${roomId}/emoji`, handleEmoji);
      subscribe(`topic/room/${roomId}/chat`, handleChat);
    },
    [
      handleChat,
      handleEmoji,
      handleToggleDevice,
      handleToggleHandsUp,
      subscribe,
      connect,
      handleConsumeTrack,
      handleLeave,
      handleParticipant,
    ],
  );

  return { disconnect, initSignaling, publish, request, subscribe, unsubscribeAll };
};
