import { Device } from 'mediasoup-client';
import { RtpCapabilities } from 'mediasoup-client/types';
import { create } from 'zustand';

interface WebrtcState {
  device: Device | null;
  initDevice: (capabilities: RtpCapabilities) => Promise<Device | null>;
  clearDevice: () => void;
  isLoaded: boolean;
  isExitingRoom: boolean;
}

export const useWebrtcStore = create<WebrtcState>((set, get) => ({
  clearDevice: () => {
    set({ device: null, isLoaded: false });
  },
  device: null,
  initDevice: async (capabilities) => {
    const { device, isLoaded } = get();
    if (device || isLoaded) {
      return get().device;
    }

    try {
      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities: capabilities });

      set({ device: newDevice, isLoaded: true });
      return newDevice;
    } catch {
      return null;
    }
  },
  isExitingRoom: false,
  isLoaded: false,
}));
