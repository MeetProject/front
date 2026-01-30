import { create } from 'zustand';

import { DeviceEnableType, DeviceKindType } from '@/types/deviceType';
import { EmojiType } from '@/types/emojiType';
import { UserDataType, UserRegisterPayloadType } from '@/types/userType';

interface ParticipantState {
  participants: string[];
  streams: Map<string, MediaStream | null>;
  devices: Map<string, DeviceEnableType>;
  info: Map<string, UserRegisterPayloadType>;
  emoji: Map<string, EmojiType | null>;
  userEmoji: EmojiType | null;

  addParticipant: (value: UserDataType) => void;
  removeParticipant: (id: string) => void;
  removeStream: (id: string) => void;
  toggleDevices: (id: string, key: DeviceKindType, value?: boolean) => void;
  reset: () => void;
  setEmoji: (id: string, value: EmojiType | null) => void;
}

export const useParticipantStore = create<ParticipantState>((set, get) => ({
  addParticipant: ({ color, device, id, name, stream }) =>
    set((prev) => {
      const newIds = [...prev.participants, id];

      const newStreams = new Map(prev.streams);
      newStreams.set(id, stream);

      const newDevices = new Map(prev.devices);
      newDevices.set(id, device);

      const newInfo = new Map(prev.info);
      newInfo.set(id, { color, name });

      return { devices: newDevices, info: newInfo, participants: newIds, streams: newStreams };
    }),

  devices: new Map(),
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
  participants: [
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
  ],
  removeParticipant: (id: string) =>
    set((prev) => {
      const newIds = prev.participants.filter((i) => i !== id);

      const newStreams = new Map(prev.streams);
      newStreams.delete(id);

      const newDevices = new Map(prev.devices);
      newDevices.delete(id);

      const newInfo = new Map(prev.info);
      newInfo.delete(id);

      return { devices: newDevices, info: newInfo, participants: newIds, streams: newStreams };
    }),

  removeStream: (id: string) =>
    set((prev) => {
      const newStreams = new Map(prev.streams);
      newStreams.delete(id);

      return { streams: newStreams };
    }),
  reset: () => set(useParticipantStore.getInitialState()),

  setEmoji: (id, value) =>
    set((prev) => {
      const newMap = new Map(prev.emoji);
      newMap.set(id, value);
      return { emoji: newMap };
    }),

  streams: new Map(),

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
