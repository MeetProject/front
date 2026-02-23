'use client';

import { useCallback } from 'react';

import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import {
  ChatResponseType,
  EmojiResponseType,
  LeaveResponseType,
  ParticipantResponseType,
  ProducerResponseType,
  ToggleDeviceEnalbeResponseType,
  ToggleHandsUpResponseType,
  TrackResponseType,
} from '@/types/session';
import { AppData } from '@/types/webRtc';

export const useSignalingHandler = (
  subscribe: <T>(destination: string, callback: (response: T) => void | Promise<void>) => void,
  consumeTrack: (
    targetId: string,
    producerId: string,
  ) => Promise<{
    appData: AppData;
    track: MediaStreamTrack;
  } | null>,
  removeConsumer: (userId: string) => void,
) => {
  const handleToggleDevice = useCallback(async (data: ToggleDeviceEnalbeResponseType) => {
    const { toggleDevices } = useParticipantStore.getState();
    const { mediaOption, userId } = data;
    toggleDevices(userId, mediaOption);
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
    const { userId: id } = useUserInfoStore.getState();
    const { addParticipant } = useParticipantStore.getState();
    const { toggleHandsUp } = useInteractionStore.getState();

    const {
      isHandUp,
      user: { userId },
    } = participant;

    if (participant.user.userId === id) {
      return;
    }
    addParticipant(participant);

    if (isHandUp) {
      toggleHandsUp(userId);
    }
  }, []);

  const handleProducer = useCallback(
    async (data: ProducerResponseType) => {
      const { addTrack } = useParticipantStore.getState();
      const { producerId, userId } = data;

      const trackInfo = await consumeTrack(userId, producerId);
      if (!trackInfo) {
        return;
      }
      addTrack(trackInfo);
    },
    [consumeTrack],
  );

  const handleConsumeTrack = useCallback(
    async (data: TrackResponseType) => {
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
    [consumeTrack],
  );

  const handleLeave = useCallback(
    async ({ userId }: LeaveResponseType) => {
      const { removeParticipant } = useParticipantStore.getState();
      removeParticipant(userId);
      removeConsumer(userId);
    },
    [removeConsumer],
  );

  const initSignaling = useCallback(
    async (roomId: string) => {
      subscribe(`/topic/room/${roomId}/participant`, (data: ParticipantResponseType) => handleParticipant(data));
      subscribe(`/topic/room/${roomId}/track`, (data: TrackResponseType) => handleConsumeTrack(data));
      subscribe(`/topic/room/${roomId}/rtls`, handleProducer);
      subscribe(`/topic/room/${roomId}/leave`, (data: LeaveResponseType) => handleLeave(data));

      subscribe(`/topic/room/${roomId}/device`, handleToggleDevice);
      subscribe(`/topic/room/${roomId}/handup`, handleToggleHandsUp);
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
      handleProducer,
    ],
  );

  return { initSignaling };
};
