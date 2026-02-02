import { Device } from 'mediasoup-client';
import { create } from 'zustand';

import { requestCapability } from '@/service/webRtc';

interface WebrtcState {
  device: Device | null;
  initDevice: () => Promise<Device | null>;
  isLoaded: boolean;
}

export const useWebrtcStore = create<WebrtcState>((set, get) => ({
  device: null,
  initDevice: async () => {
    const { device, isLoaded } = get();
    if (device || isLoaded) {
      return get().device;
    }

    try {
      const routerRtpCapabilities = await requestCapability();

      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities });

      set({ device: newDevice, isLoaded: true });
      return newDevice;
    } catch {
      return null;
    }
  },
  isLoaded: false,
}));
