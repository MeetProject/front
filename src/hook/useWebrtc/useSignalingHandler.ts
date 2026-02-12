'use client';

import { useCallback } from 'react';

import { useSignaling } from './useSignaling';

import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import {
  ChatResponseType,
  EmojiResponseType,
  ToggleDeviceEnalbeResponseType,
  ToggleHandsUpResponseType,
} from '@/types/session';

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

  const initSignaling = useCallback(
    async (roomId: string) => {
      await connect();
      //subscribe(`topic/room/${roomId}/join`, handleJoinUser);
      subscribe(`topic/room/${roomId}/device`, handleToggleDevice);
      //subscribe(`topic/room/${roomId}/track`, handleTrack);
      subscribe(`topic/room/${roomId}/handsUp`, handleToggleHandsUp);
      subscribe(`topic/room/${roomId}/emoji`, handleEmoji);
      subscribe(`topic/room/${roomId}/chat`, handleChat);
      //subscribe(`topic/room/${roomId}/leave`, handleLeave);
    },
    [connect, subscribe, handleToggleDevice, handleChat, handleEmoji, handleToggleHandsUp],
  );

  return { disconnect, initSignaling, publish, request, subscribe, unsubscribeAll };
};
