import { create } from 'zustand';

import { DeviceEnableType, TrackType } from '@/types/deviceType';
import { EmojiType } from '@/types/emojiType';
import { AppData, ChatResponseType, ParticipantDataType } from '@/types/session';
import { UserRegisterPayloadType } from '@/types/userType';
import { mergeScreenTrack, replaceUserStream, stopStream } from '@/util/stream';

interface StreamInfo {
  userId: string | null;
  stream: null | MediaStream;
}

interface ParticipantState {
  participants: string[];
  videoStreams: Map<string, MediaStream>;
  screenStream: StreamInfo;
  devices: Map<string, DeviceEnableType>;
  info: Map<string, UserRegisterPayloadType>;
  emoji: Map<string, EmojiType | null>;
  chat: ChatResponseType[];

  addChat: (value: ChatResponseType) => void;
  addParticipant: (userData: ParticipantDataType) => void;
  addTrack: (trackInfo: ConsumerResult) => void;
  removeParticipant: (id: string) => void;
  removeTrack: (id: string, trackType: TrackType) => void;
  toggleDevices: (id: string, value: DeviceEnableType) => void;
  reset: () => void;
  addEmoji: (id: string, value: EmojiType | null) => void;
  removeEmoji: (id: string) => void;
}

interface ConsumerResult {
  appData: AppData;
  track: MediaStreamTrack;
}

export const useParticipantStore = create<ParticipantState>((set, get) => ({
  addChat: (data) => set((prev) => ({ chat: [...prev.chat, data] })),

  addEmoji: (id, value) =>
    set((state) => {
      const nextEmoji = new Map(state.emoji);
      nextEmoji.set(id, value);
      return { emoji: nextEmoji };
    }),

  addParticipant: (participant) => {
    set((state) => {
      const {
        mediaOption,
        user: { profileColor, userId, userName },
      } = participant;

      const newInfo = new Map(state.info);
      newInfo.set(userId, { userColor: profileColor, userName: userName });

      const newDevices = new Map(state.devices);
      newDevices.set(userId, mediaOption);

      const participants = state.participants.includes(userId) ? state.participants : [...state.participants, userId];

      return { devices: newDevices, info: newInfo, participants };
    });
  },

  addTrack: (trackInfo) => {
    const {
      appData: { trackType, userId },
      track,
    } = trackInfo;

    set((state) => {
      if (trackType.includes('screen')) {
        const newStream = mergeScreenTrack(state.screenStream.stream, state.screenStream.userId, userId, track);
        return { screenStream: { stream: newStream, userId } };
      }

      const newStreams = new Map(state.videoStreams);
      newStreams.set(userId, replaceUserStream(state.videoStreams.get(userId), track));
      return { videoStreams: newStreams };
    });
  },

  chat: [],
  devices: new Map(),

  emoji: new Map(),
  info: new Map(),
  participants: [],
  removeEmoji: (id) =>
    set((prev) => {
      if (!prev.emoji.has(id)) {
        return {};
      }
      const nextEmoji = new Map(prev.emoji);
      nextEmoji.delete(id);
      return { emoji: nextEmoji };
    }),
  removeParticipant: (id) =>
    set((prev) => {
      const newIds = prev.participants.filter((i) => i !== id);

      const newStreams = new Map(prev.videoStreams);
      newStreams.delete(id);

      const newDevices = new Map(prev.devices);
      newDevices.delete(id);

      const newInfo = new Map(prev.info);
      newInfo.delete(id);

      const newEmoji = new Map(prev.emoji);
      newEmoji.delete(id);

      const newTimer = new Map(prev.timer);
      const existingTimer = newTimer.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
        newTimer.delete(id);
      }

      const isScreenOwner = prev.screenStream.userId === id;
      if (isScreenOwner) {
        prev.screenStream.stream?.getTracks().forEach((t) => t.stop());
      }
      const screenStream = isScreenOwner ? { stream: null, userId: null } : prev.screenStream;

      return {
        devices: newDevices,
        emoji: newEmoji,
        info: newInfo,
        participants: newIds,
        screenStream,
        timer: newTimer,
        videoStreams: newStreams,
      };
    }),
  removeTrack: (id, trackType) =>
    set((prev) => {
      if (trackType === 'screen') {
        stopStream(prev.screenStream.stream);
        return { screenStream: { stream: null, userId: null } };
      }

      if (trackType === 'audio') {
        return {};
      }

      const prevStreams = new Map(prev.videoStreams);
      stopStream(prevStreams.get(id));
      prevStreams.delete(id);

      return { videoStreams: prevStreams };
    }),

  reset: () => {
    set(useParticipantStore.getInitialState());
  },

  screenStream: { stream: null, userId: null },

  toggleDevices: (id, value) => {
    if (!get().devices.has(id)) {
      return;
    }

    set((prev) => {
      const newDevices = new Map(prev.devices);
      newDevices.set(id, value);
      return { devices: newDevices };
    });
  },

  videoStreams: new Map(),
}));
