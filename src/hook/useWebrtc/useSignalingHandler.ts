'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useAudioStore } from '@/store/useAudioStore';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useLocalMuteStore } from '@/store/useLocalMuteStore';
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
} from '@/types/session';

const EMOJI_DURATION_MS = 8000;
const FLOATING_EMOJI_DURATION_MS = 4000;

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
  const floatingEmojiTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
    const { addEmoji, removeEmoji: removeFloatingEmoji } = useInteractionStore.getState();
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

    const floatingTimer = setTimeout(() => {
      removeFloatingEmoji(id);
      floatingEmojiTimers.current.delete(id);
    }, FLOATING_EMOJI_DURATION_MS);
    floatingEmojiTimers.current.set(id, floatingTimer);
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

  const handleLeave = useCallback(
    async ({ userId }: LeaveResponseType) => {
      const { removeParticipant } = useParticipantStore.getState();
      const { handsUp, toggleHandsUp } = useInteractionStore.getState();
      const { unmute } = useLocalMuteStore.getState();

      removeParticipant(userId);
      removeConsumer(userId);

      if (handsUp.has(userId)) {
        toggleHandsUp(userId);
      }
      unmute(userId);

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
      handleLeave,
      handleParticipant,
      handleProducer,
      handleRemoveProducer,
    ],
  );

  useEffect(() => {
    const timers = emojiTimers.current;
    const floatingTimers = floatingEmojiTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      floatingTimers.forEach((timer) => clearTimeout(timer));
      floatingTimers.clear();
    };
  }, []);

  return { initSubscribe };
};
