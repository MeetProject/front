import { partition } from 'lodash';
import { create } from 'zustand';

import { GroupChatType } from '@/types/chatType';
import { DeviceEnableType, DeviceKindType } from '@/types/deviceType';
import { EmojiType } from '@/types/emojiType';
import { ChatResponseType, ParticipantDataType } from '@/types/session';
import { UserRegisterPayloadType } from '@/types/userType';
import { AppData } from '@/types/webRtc';

const TEST_PARTICIPANTS = [
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
];

interface ParticipantState {
  participants: string[];
  streams: Map<string, MediaStream | null>;
  screenStream: MediaStream | null;
  devices: Map<string, DeviceEnableType>;
  info: Map<string, UserRegisterPayloadType>;
  emoji: Map<string, EmojiType | null>;
  userEmoji: EmojiType | null;
  timer: Map<string, NodeJS.Timeout | null>;
  chat: GroupChatType[];

  addChat: (value: ChatResponseType) => void;

  addParticipant: (
    value: ParticipantDataType,
    consumeTrack: (id: string) => Promise<{
      appData: AppData;
      track: MediaStreamTrack;
    } | null>,
  ) => void;
  removeParticipant: (id: string) => void;
  removeStream: (id: string) => void;
  toggleDevices: (id: string, key: DeviceKindType, value?: boolean) => void;
  reset: () => void;
  addEmoji: (id: string, value: EmojiType | null, isMe?: boolean) => void;
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

  addEmoji: (id, value, isMe) => {
    const existingTimer = get().timer.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timerId = setTimeout(() => {
      set((state) => {
        state.timer.delete(id);

        if (isMe) {
          return { userEmoji: null };
        }
        const nextEmoji = new Map(state.emoji);
        nextEmoji.delete(id);

        return { emoji: nextEmoji };
      });
    }, 8000);

    set((state) => {
      state.timer.set(id, timerId);
      if (isMe) {
        return { userEmoji: value };
      }
      const nextEmoji = new Map(state.emoji);
      nextEmoji.set(id, value);

      return { emoji: nextEmoji };
    });
  },

  addParticipant: async ({ produceId, ...userData }, consumeTrack) => {
    const results = await Promise.allSettled(produceId.map((id) => consumeTrack(id)));
    const tracksInfo = results
      .filter((res): res is PromiseFulfilledResult<any> => res.status === 'fulfilled' && res.value !== null)
      .map((res) => res.value);

    const [screenTracks, userTracks] = partition(tracksInfo, ({ appData }) => appData.trackType?.includes('screen'));

    if (screenTracks.length > 0) {
      set({ screenStream: new MediaStream(screenTracks.map((t) => t.track)) });
    }

    const userStream = new MediaStream(userTracks.map((t) => t.track));

    set((state) => {
      const { color, deviceEnable, id, name } = userData;

      const newInfo = new Map(state.info);
      newInfo.set(userData.id, { color, name });

      const newStreams = new Map(state.streams);
      newStreams.set(id, userStream);

      const newDevices = new Map(state.devices);
      newDevices.set(id, deviceEnable);

      return { devices: newDevices, info: newInfo, participants: [...state.participants, id], streams: newStreams };
    });
  },
  chat: [],
  devices: new Map(TEST_PARTICIPANTS.map((id) => [id, { audio: true, video: true }])),
  emoji: new Map(),
  info: new Map([
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
  ]),
  participants: TEST_PARTICIPANTS,
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

  reset: () => {
    get().timer.forEach((t) => t && clearTimeout(t));
    set(useParticipantStore.getInitialState());
  },

  screenStream: null,
  streams: new Map(TEST_PARTICIPANTS.map((id) => [id, null])),

  timer: new Map(),

  toggleDevices: (id, key, value) => {
    if (!get().devices.has(id)) {
      return;
    }

    set((prev) => {
      const newDevices = new Map(prev.devices);
      const prevData = prev.devices.get(id);
      if (!prevData) {
        return {};
      }
      newDevices.set(id, { ...prevData, [key]: value ?? !prevData[key] });
      return { devices: newDevices };
    });
  },
  userEmoji: null,
}));
