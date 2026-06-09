import { create } from 'zustand';

import { DeviceType, DeviceEnableType, DeviceKindType, StatusType } from '@/types/deviceType';

interface DeviceState {
  isInit: boolean;

  device: Record<DeviceType, MediaDeviceInfo | null>;
  deviceEnable: DeviceEnableType;
  permission: Record<DeviceKindType, PermissionState>;

  deviceList: Record<DeviceType, MediaDeviceInfo[]>;
  status: StatusType;

  stream: MediaStream | null;
  screenStream: MediaStream | null;

  changeDevice: (type: DeviceType, value: MediaDeviceInfo) => void;
  changeDeviceList: (type: DeviceType, value: MediaDeviceInfo[]) => void;
  toggleDeviceEnable: (type: DeviceKindType) => void;
  updatePermission: (type: DeviceKindType, value: PermissionState) => void;
}
export const useDeviceStore = create<DeviceState>((set) => ({
  changeDevice: (type, value) => set((state) => ({ device: { ...state.device, [type]: value } })),
  changeDeviceList: (type, value) => set((state) => ({ deviceList: { ...state.deviceList, [type]: value } })),
  device: {
    audioInput: null,
    audioOutput: null,
    videoInput: null,
  },
  deviceEnable: {
    audio: true,
    video: true,
  },

  deviceList: {
    audioInput: [],
    audioOutput: [],
    videoInput: [],
  },
  isInit: false,
  permission: { audio: 'prompt', video: 'prompt' },
  screenStream: null,
  status: null,
  stream: null,

  toggleDeviceEnable: (type) =>
    set((state) => ({ deviceEnable: { ...state.deviceEnable, [type]: !state.deviceEnable[type] } })),
  updatePermission: (type, value) => set((state) => ({ permission: { ...state.permission, [type]: value } })),
}));
