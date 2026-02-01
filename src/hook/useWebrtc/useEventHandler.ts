'use client';

import { useCallback } from 'react';

import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import {
  ChatResponseType,
  EmojiResponseType,
  ParticipantDataType,
  ToggleDeviceEnalbeResponseType,
  ToggleHandsUpResponseType,
} from '@/types/session';

export const useEventHandler = () => {
  const handleJoinUser = useCallback(
    async (participantData: ParticipantDataType, processParticipant: (data: ParticipantDataType) => void) => {
      const { info } = useParticipantStore.getState();

      if (info.has(participantData.id)) {
        return;
      }

      processParticipant(participantData);
    },
    [],
  );

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

  return { handleChat, handleEmoji, handleJoinUser, handleToggleDevice, handleToggleHandsUp };
};
