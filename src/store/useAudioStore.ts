import { create } from 'zustand';

import { useDeviceStore } from '@/store/useDeviceStore';
import { AppData } from '@/types/session';
import { createAudioContext } from '@/util/audio';
import { canSelectOutputDevice } from '@/util/env';

interface ConsumerResult {
  appData: AppData;
  track: MediaStreamTrack;
}

type MediaElementWithSink = HTMLAudioElement & { setSinkId?: (deviceId: string) => Promise<void> };

interface AudioEntry {
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode;
  element: MediaElementWithSink;
}

interface AudioState {
  audio: Map<string, AudioEntry>;
  audioContext: AudioContext | null;
  addAudioTrack: (trackInfo: ConsumerResult) => Promise<void>;
  removeAudioTrack: (id: string) => void;
  resumeAudioContext: () => Promise<void>;
  setOutputDevice: (deviceId: string) => Promise<void>;
}

const applySinkId = async (element: MediaElementWithSink, deviceId?: string) => {
  if (!deviceId || !canSelectOutputDevice() || typeof element.setSinkId !== 'function') {
    return;
  }

  try {
    await element.setSinkId(deviceId);
  } catch {}
};

export const useAudioStore = create<AudioState>((set, get) => ({
  addAudioTrack: async (trackInfo) => {
    const {
      appData: { userId },
      track,
    } = trackInfo;

    const audioContext = get().audioContext ?? createAudioContext();
    if (!audioContext) {
      return;
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    const previous = get().audio.get(userId);
    if (previous) {
      previous.source.disconnect();
      previous.analyser.disconnect();
      previous.element.pause();
      previous.element.srcObject = null;
      previous.element.load();
    }

    const stream = new MediaStream([track]);

    const element = new window.Audio() as MediaElementWithSink;
    element.srcObject = stream;
    element.autoplay = true;

    const { audioOutput } = useDeviceStore.getState().device;
    await applySinkId(element, audioOutput?.deviceId);
    element.play().catch(() => {});

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    const newAudioMap = new Map(get().audio);
    newAudioMap.set(userId, { analyser, element, source });

    set({ audio: newAudioMap, audioContext });
  },
  audio: new Map(),
  audioContext: null,

  removeAudioTrack: (id: string) => {
    const entry = get().audio.get(id);
    if (!entry) {
      return;
    }

    entry.source.disconnect();
    entry.analyser.disconnect();

    entry.element.pause();
    entry.element.srcObject = null;
    entry.element.load();

    const newAudioMap = new Map(get().audio);
    newAudioMap.delete(id);

    set({ audio: newAudioMap });
  },

  resumeAudioContext: async () => {
    const audioContext = get().audioContext;
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch {}
    }

    get().audio.forEach((entry) => entry.element.play().catch(() => {}));
  },

  setOutputDevice: async (deviceId: string) => {
    await Promise.all(Array.from(get().audio.values()).map((entry) => applySinkId(entry.element, deviceId)));
  },
}));
