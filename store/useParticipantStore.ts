import { create } from 'zustand';

import { DeviceEnableType, DeviceKindType } from '@/types/deviceType';
import { UserDataType, UserRegisterPayloadType } from '@/types/userType';

interface ParticipantState {
  participants: string[];
  streams: Map<string, MediaStream | null>;
  isHandsUp: Map<string, boolean>;
  devices: Map<string, DeviceEnableType>;
  info: Map<string, UserRegisterPayloadType>;

  addParticipant: (value: UserDataType) => void;
  removeParticipant: (id: string) => void;
  removeStream: (id: string) => void;
  toggleDevices: (id: string, key: DeviceKindType, value?: boolean) => void;
  toggleHandsUp: (id: string, value?: boolean) => void;
  reset: () => void;
}

export const useParticipantStore = create<ParticipantState>((set, get) => ({
  addParticipant: ({ color, device, id, isHandsUp, name, stream }) =>
    set((prev) => {
      const newIds = [...prev.participants, id];

      const newStreams = new Map(prev.streams);
      newStreams.set(id, stream);

      const newHandsUp = new Map(prev.isHandsUp);
      if (isHandsUp) {
        newHandsUp.set(id, isHandsUp);
      }

      const newDevices = new Map(prev.devices);
      newDevices.set(id, device);

      const newInfo = new Map(prev.info);
      newInfo.set(id, { color, name });

      return { devices: newDevices, info: newInfo, isHandsUp: newHandsUp, participants: newIds, streams: newStreams };
    }),

  devices: new Map(),
  info: new Map(),
  isHandsUp: new Map(),
  participants: [],

  removeParticipant: (id: string) =>
    set((prev) => {
      const newIds = prev.participants.filter((i) => i !== id);

      const newStreams = new Map(prev.streams);
      newStreams.delete(id);

      const newHandsUp = new Map(prev.isHandsUp);
      newHandsUp.delete(id);

      const newDevices = new Map(prev.devices);
      newDevices.delete(id);

      const newInfo = new Map(prev.info);
      newInfo.delete(id);

      return { devices: newDevices, info: newInfo, isHandsUp: newHandsUp, participants: newIds, streams: newStreams };
    }),

  removeStream: (id: string) =>
    set((prev) => {
      const newStreams = new Map(prev.streams);
      newStreams.delete(id);

      return { streams: newStreams };
    }),
  reset: () => set(useParticipantStore.getInitialState()),

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

  toggleHandsUp: (id, value) => {
    if (!get().devices.has(id)) {
      return;
    }

    set((prev) => {
      const newHandsUp = new Map(prev.isHandsUp);
      const prevData = prev.devices.get(id);

      if (value || !prevData) {
        newHandsUp.set(id, true);
      } else {
        newHandsUp.delete(id);
      }

      return { isHandsUp: newHandsUp };
    });
  },
}));
