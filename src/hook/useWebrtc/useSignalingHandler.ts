'use client';

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

export const useSignalingHandler = (
  consumeTrack: (id: string) => Promise<{
    appData: AppData;
    track: MediaStreamTrack;
  } | null>,
  removeConsumer: (id: string) => void,
) => {
  const { connect, disconnect, publish, subscribe, unsubscribeAll } = useSignaling(SERVER_URL);
  const handleJoinUser = useCallback(
    async (participantData: ParticipantDataType) => {
      const { addParticipant, info } = useParticipantStore.getState();
      if (!participantData.id || info.has(participantData.id)) {
        return;
      }
      await addParticipant(participantData, consumeTrack);
    },
    [consumeTrack],
  );

  const handleToggleDevice = useCallback(async (data: ToggleDeviceEnalbeResponseType) => {
    const { toggleDevices } = useParticipantStore.getState();
    const { deviceType, userId } = data;
    toggleDevices(userId, deviceType);
  }, []);

  const handleTrack = useCallback(
    async (data: TrackResponseType) => {
      const { addTrack } = useParticipantStore.getState();
      addTrack(data, consumeTrack);
    },
    [consumeTrack],
  );

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
      await connect();
      subscribe(`topic/room/${roomId}/join`, handleJoinUser);
      subscribe(`topic/room/${roomId}/device`, handleToggleDevice);
      subscribe(`topic/room/${roomId}/track`, handleTrack);
      subscribe(`topic/room/${roomId}/handsUp`, handleToggleHandsUp);
      subscribe(`topic/room/${roomId}/emoji`, handleEmoji);
      subscribe(`topic/room/${roomId}/chat`, handleChat);
      subscribe(`topic/room/${roomId}/leave`, handleLeave);
    },
    [
      connect,
      subscribe,
      handleToggleDevice,
      handleJoinUser,
      handleChat,
      handleTrack,
      handleEmoji,
      handleToggleHandsUp,
      handleLeave,
    ],
  );

  return { disconnect, initSignaling, publish, unsubscribeAll };
};
