import { create } from 'zustand';

import { GroupChatType } from '@/types/chatType';
import { DeviceEnableType, TrackType } from '@/types/deviceType';
import { EmojiType } from '@/types/emojiType';
import { ChatResponseType, ParticipantDataType } from '@/types/session';
import { UserRegisterPayloadType } from '@/types/userType';
import { AppData } from '@/types/webRtc';

/* const TEST_PARTICIPANTS = [
  'Alpha',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Golf',
  'Hotel',
  'India',
  'Juliet',
  'Kilo',
  'Lima',
  'Mike',
  'November',
  'Oscar',
  'Papa',
  'Quebec',
  'Romeo',
  'Sierra',
  'Tango',
]; */

interface StreamInfo {
  userId: string | null;
  stream: null | MediaStream;
}

interface ParticipantState {
  participants: string[];
  streams: Map<string, MediaStream>;
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
  removeStream: (id: string) => void;
  removeTrack: (userId: string, trackType: TrackType) => void;
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
      if (newChat.length !== 0 && newChat[newChat.length - 1].userId === userId) {
        newChat[newChat.length - 1].messages.push(chatData);
        return { chat: newChat };
      }

      newChat.push({ messages: [chatData], userId: data.userId });
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

      return { devices: newDevices, info: newInfo, participants: [...state.participants, userId] };
    });
  },

  addTrack: async (trackInfo) => {
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

      const newStreams = new Map(state.streams);
      const existingStream = new MediaStream(newStreams.get(userId)?.getTracks() ?? []);
      existingStream.addTrack(track);
      newStreams.set(userId, existingStream);
      return { streams: newStreams };
    });
  },
  chat: [],

  devices: new Map(/* TEST_PARTICIPANTS.map((id) => [id, { audio: true, video: true }]) */),
  emoji: new Map(),
  info: new Map(/* [
    ['Alpha', { color: '#FF6B6B', name: 'Alpha' }],
    ['Bravo', { color: '#4D96FF', name: 'Bravo' }],
    ['Charlie', { color: '#6BCB77', name: 'Charlie' }],
    ['Delta', { color: '#FFD93D', name: 'Delta' }],
    ['Echo', { color: '#845EC2', name: 'Echo' }],
    ['Foxtrot', { color: '#FF9671', name: 'Foxtrot' }],
    ['Golf', { color: '#00C9A7', name: 'Golf' }],
    ['Hotel', { color: '#C34A36', name: 'Hotel' }],
    ['India', { color: '#2C73D2', name: 'India' }],
    ['Juliet', { color: '#F9A826', name: 'Juliet' }],
    ['Kilo', { color: '#3D5AFE', name: 'Kilo' }],
    ['Lima', { color: '#FF7043', name: 'Lima' }],
    ['Mike', { color: '#26A69A', name: 'Mike' }],
    ['November', { color: '#AB47BC', name: 'November' }],
    ['Oscar', { color: '#EC407A', name: 'Oscar' }],
    ['Papa', { color: '#7CB342', name: 'Papa' }],
    ['Quebec', { color: '#29B6F6', name: 'Quebec' }],
    ['Romeo', { color: '#FFA726', name: 'Romeo' }],
    ['Sierra', { color: '#8D6E63', name: 'Sierra' }],
    ['Tango', { color: '#78909C', name: 'Tango' }],
  ] */),
  participants: /* TEST_PARTICIPANTS */ [],
  removeParticipant: (id: string) =>
    set((prev) => {
      const newIds = prev.participants.filter((i) => i !== id);

      const newStreams = new Map(prev.streams);
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

      return { devices: newDevices, emoji: newEmoji, info: newInfo, participants: newIds, streams: newStreams };
    }),
  removeStream: (id: string) =>
    set((prev) => {
      const newStreams = new Map(prev.streams);
      newStreams.delete(id);

      return { streams: newStreams };
    }),

  removeTrack: (userId, trackType) =>
    set((state) => {
      const { screenStream, streams } = state;

      if (trackType === 'audio' || trackType === 'video') {
        const newMap = new Map(streams);
        const currentStream = newMap.get(userId);
        if (!currentStream) {
          return {};
        }

        const track = trackType === 'audio' ? currentStream.getAudioTracks() : currentStream.getVideoTracks();

        track.forEach((t) => currentStream.removeTrack(t));
        if (currentStream.getTracks().length === 0) {
          newMap.delete(userId);
        }

        return { streams: newMap };
      }

      if (!screenStream.stream) {
        return { screenStream: { stream: null, userId: null } };
      }

      screenStream.stream.getTracks().forEach((t) => t.stop());

      return { screenStream: { stream: null, userId: null } };
    }),
  reset: () => {
    get().timer.forEach((t) => t && clearTimeout(t));
    set(useParticipantStore.getInitialState());
  },

  screenStream: { stream: null, userId: null },
  streams: new Map(),

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
  userEmoji: null,
}));
