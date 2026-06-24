'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useAudioStore } from '@/store/useAudioStore';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { TrackType } from '@/types/deviceType';
import {
  AppData,
  ChatResponseType,
  EmojiResponseType,
  LeaveResponseType,
  ParticipantResponseType,
  ProducerRemoveResponseType,
  ProducerResponseType,
  ToggleDeviceEnableResponseType,
  ToggleHandsUpResponseType,
  TrackResponseType,
} from '@/types/session';

const EMOJI_DURATION_MS = 8000;

export const useSignalingHandler = (
  subscribe: <T>(destination: string, callback: (response: T) => void | Promise<void>) => void,
  consumeTrack: (
    targetId: string,
    producerId: string,
  ) => Promise<{
    appData: AppData;
    track: MediaStreamTrack;
  } | null>,
  removeConsumer: (userId: string, trackType?: TrackType) => void,
) => {
  const emojiTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleToggleDevice = useCallback(async (data: ToggleDeviceEnableResponseType) => {
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
    const { addEmoji: addEmojiStatus, removeEmoji } = useParticipantStore.getState();
    const { id, ...emojiData } = data;
    const { userId } = emojiData;

    addEmoji(id, data);
    addEmojiStatus(userId, emojiData.emoji);

    const existingTimer = emojiTimers.current.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      removeEmoji(userId);
      emojiTimers.current.delete(userId);
    }, EMOJI_DURATION_MS);
    emojiTimers.current.set(userId, timer);
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
      const { userId: id } = useUserInfoStore.getState();
      const { addTrack } = useParticipantStore.getState();
      const { addAudioTrack } = useAudioStore.getState();
      const { producerId, userId } = data;

      if (userId === id) {
        return;
      }

      const trackInfo = await consumeTrack(userId, producerId);

      if (!trackInfo) {
        return;
      }

      if (trackInfo.appData.trackType === 'audio') {
        addAudioTrack(trackInfo);
        return;
      }
      addTrack(trackInfo);
    },
    [consumeTrack],
  );

  const handleRemoveProducer = useCallback(
    (data: ProducerRemoveResponseType) => {
      const { removeTrack } = useParticipantStore.getState();
      const { trackType, userId } = data;

      removeTrack(userId, trackType);
      removeConsumer(userId, trackType);
    },
    [removeConsumer],
  );

  const handleConsumeTrack = useCallback(
    async (data: TrackResponseType) => {
      const { userId } = useUserInfoStore.getState();
      const { addTrack } = useParticipantStore.getState();
      const { addAudioTrack } = useAudioStore.getState();

      const { produceId, userId: target } = data;
      if (userId === target) {
        return;
      }

      const consumeResult = await Promise.allSettled(produceId.map((id) => consumeTrack(target, id)));
      const successResult = consumeResult
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      successResult.forEach((r) => {
        if (!r) {
          return;
        }
        if (r.appData.trackType === 'audio') {
          addAudioTrack(r);
          return;
        }
        addTrack(r);
      });
    },
    [consumeTrack],
  );

  const handleLeave = useCallback(
    async ({ userId }: LeaveResponseType) => {
      const { removeParticipant } = useParticipantStore.getState();
      removeParticipant(userId);
      removeConsumer(userId);

      const timer = emojiTimers.current.get(userId);
      if (timer) {
        clearTimeout(timer);
        emojiTimers.current.delete(userId);
      }
    },
    [removeConsumer],
  );

  const initSubscribe = useCallback(
    async (roomId: string) => {
      subscribe(`/topic/room/${roomId}/participant`, (data: ParticipantResponseType) => handleParticipant(data));
      subscribe(`/topic/room/${roomId}/track`, (data: TrackResponseType) => handleConsumeTrack(data));
      subscribe(`/topic/room/${roomId}/rtls`, handleProducer);
      subscribe(`/topic/room/${roomId}/producer/remove`, handleRemoveProducer);
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
      handleRemoveProducer,
    ],
  );

  useEffect(() => {
    const timers = emojiTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return { initSubscribe };
};
