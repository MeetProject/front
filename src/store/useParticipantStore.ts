import { create } from 'zustand';

import { GroupChatType } from '@/types/chatType';
import { DeviceEnableType, TrackType } from '@/types/deviceType';
import { EmojiType } from '@/types/emojiType';
import { AppData, ChatResponseType, ParticipantDataType } from '@/types/session';
import { UserRegisterPayloadType } from '@/types/userType';

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
  timer: Map<string, NodeJS.Timeout | null>;
  chat: GroupChatType[];

  addChat: (value: ChatResponseType) => void;

  addParticipant: (userData: ParticipantDataType) => void;
  addTrack: (trackInfo: ConsumerResult) => void;
  removeParticipant: (id: string) => void;
  removeTrack: (id: string, trackType: TrackType) => void;
  toggleDevices: (id: string, value: DeviceEnableType) => void;
  reset: () => void;
  addEmoji: (id: string, value: EmojiType | null) => void;
}

interface ConsumerResult {
  appData: AppData;
  track: MediaStreamTrack;
}

export const useParticipantStore = create<ParticipantState>((set, get) => ({
  addChat: (data: ChatResponseType) => {
    set((prev) => {
      const newChat = [...prev.chat];
      const { userId, ...chatData } = data;
      const lastGroup = newChat[newChat.length - 1];
      if (lastGroup && lastGroup.userId === userId) {
        newChat[newChat.length - 1] = { ...lastGroup, messages: [...lastGroup.messages, chatData] };
        return { chat: newChat };
      }

      newChat.push({ messages: [chatData], userId });
      return { chat: newChat };
    });
  },
  addEmoji: (id, value) => {
    const existingTimer = get().timer.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timerId = setTimeout(() => {
      set((state) => {
        state.timer.delete(id);

        const nextEmoji = new Map(state.emoji);
        nextEmoji.delete(id);

        return { emoji: nextEmoji };
      });
    }, 8000);

    set((state) => {
      state.timer.set(id, timerId);
      const nextEmoji = new Map(state.emoji);
      nextEmoji.set(id, value);

      return { emoji: nextEmoji };
    });
  },
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

      const newParticipants = state.participants.includes(userId)
        ? state.participants
        : [...state.participants, userId];

      return { devices: newDevices, info: newInfo, participants: newParticipants };
    });
  },

  addTrack: (trackInfo) => {
    const {
      appData: { trackType, userId },
      track,
    } = trackInfo;

    set((state) => {
      if (trackType.includes('screen')) {
        if (state.screenStream.userId !== userId) {
          state.screenStream.stream?.getTracks().forEach((t) => {
            t.stop();
            state.screenStream.stream?.removeTrack(t);
          });
        }
        const newStream = new MediaStream(state.screenStream.stream?.getTracks() ?? []);
        newStream.addTrack(track);
        return { screenStream: { stream: newStream, userId } };
      }

      const prev = get().videoStreams.get(userId);
      if (prev) {
        prev.getTracks().forEach((t) => t.stop());
      }

      const newStreams = new Map(state.videoStreams);
      newStreams.set(userId, new MediaStream([track]));
      return { videoStreams: newStreams };
    });
  },

  chat: [],
  devices: new Map(),

  emoji: new Map(),
  info: new Map(),
  participants: [],
  removeParticipant: (id: string) =>
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

      if (prev.timer.has(id)) {
        clearTimeout(prev.timer.get(id) as NodeJS.Timeout);
        prev.timer.delete(id);
      }

      return { devices: newDevices, emoji: newEmoji, info: newInfo, participants: newIds, videoStreams: newStreams };
    }),
  removeTrack: (id: string, trackType: TrackType) =>
    set((prev) => {
      if (trackType.includes('screen')) {
        prev.screenStream.stream?.getTracks().forEach((t) => t.stop());
        return { screenStream: { stream: null, userId: null } };
      }

      if (trackType === 'audio') {
        return {};
      }

      const prevStreams = new Map(prev.videoStreams);
      prevStreams
        .get(id)
        ?.getTracks()
        .forEach((t) => t.stop());
      prevStreams.delete(id);

      return { videoStreams: prevStreams };
    }),
  reset: () => {
    get().timer.forEach((t) => t && clearTimeout(t));
    set(useParticipantStore.getInitialState());
  },

  screenStream: { stream: null, userId: null },
  timer: new Map(),

  toggleDevices: (id, value) => {
    if (!get().devices.has(id)) {
      return;
    }

    set((prev) => {
      const newDevices = new Map(prev.devices);
      const prevData = prev.devices.get(id);
      if (!prevData) {
        return {};
      }
      newDevices.set(id, value);
      return { devices: newDevices };
    });
  },

  videoStreams: new Map(),
}));
