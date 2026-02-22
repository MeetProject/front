'use client';

import { useCallback } from 'react';

import { useSignaling } from './useSignaling';

import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import {
  ChatResponseType,
  EmojiResponseType,
  LeaveResponseType,
  ParticipantResponseType,
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

  const handleParticipant = useCallback(async (data: ParticipantResponseType) => {
    const { participant } = data;
    const { userId } = useUserInfoStore.getState();
    if (participant.user.userId === userId) {
      return;
    }
    const { addParticipant } = useParticipantStore.getState();
    addParticipant(participant);
  }, []);

  const handleConsumeTrack = useCallback(
    async (
      data: TrackResponseType,
      consumeTrack: (
        targetId: string,
        producerId: string,
      ) => Promise<{
        appData: AppData;
        track: MediaStreamTrack;
      } | null>,
    ) => {
      const { userId } = useUserInfoStore.getState();
      const { addTrack } = useParticipantStore.getState();

      const { produceId, userId: target } = data;
      if (userId === target) {
        return;
      }

      const consumeResult = await Promise.allSettled(produceId.map((id) => consumeTrack(target, id)));
      const successResult = consumeResult
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      successResult.forEach((r) => r && addTrack(r));
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
      consumeTrack: (
        targetId: string,
        producerId: string,
      ) => Promise<{
        appData: AppData;
        track: MediaStreamTrack;
      } | null>,
      removeConsumer: (userId: string) => void,
    ) => {
      subscribe(`/topic/room/${roomId}/participant`, (data: ParticipantResponseType) => handleParticipant(data));
      subscribe(`/topic/room/${roomId}/track`, (data: TrackResponseType) => handleConsumeTrack(data, consumeTrack));
      subscribe(`/topic/room/${roomId}/leave`, (data: LeaveResponseType) => handleLeave(data, removeConsumer));

      subscribe(`/topic/room/${roomId}/device`, handleToggleDevice);
      subscribe(`/topic/room/${roomId}/handsUp`, handleToggleHandsUp);
      subscribe(`/topic/room/${roomId}/emoji`, handleEmoji);
      subscribe(`/topic/room/${roomId}/chat`, handleChat);
    },
    [
      handleChat,
      handleEmoji,
      handleToggleDevice,
      handleToggleHandsUp,
      subscribe,
      handleConsumeTrack,
      handleLeave,
      handleParticipant,
    ],
  );

  return { connect, disconnect, initSignaling, publish, request, subscribe, unsubscribeAll };
};
