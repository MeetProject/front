import { create } from 'zustand';

import { useDeviceStore } from '@/store/useDeviceStore';
import { AppData } from '@/types/webRtc';

interface ConsumerResult {
  appData: AppData;
  track: MediaStreamTrack;
}

interface AudioContextState {
  analyser: AnalyserNode;
  gainNode: GainNode;
  dumy: HTMLAudioElement;
}

type AudioContextWithSink = AudioContext & { setSinkId?: (deviceId: string) => Promise<void> };

interface AudioState {
  audio: Map<String, AudioContextState>;
  audioContext: AudioContext | null;
  addAudioTrack: (trackInfo: ConsumerResult) => Promise<void>;
  removeAudioTrack: (id: string) => void;
  resumeAudioContext: () => Promise<void>;
  setOutputDevice: (deviceId: string) => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  addAudioTrack: async (trackInfo) => {
    const {
      appData: { userId },
      track,
    } = trackInfo;

    const isNewContext = !get().audioContext;
    const audioContext = get().audioContext ?? new (window.AudioContext || (window as any).webkitAudioContext)();

    if (!audioContext) {
      return;
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    const mediaStream = new MediaStream([track]);

    const dumy = new window.Audio();
    dumy.srcObject = mediaStream;
    dumy.muted = true;
    dumy.play().catch((err) => {
      console.warn('더미 오디오 재생 실패:', err);
    });

    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();

    source.connect(analyser);
    analyser.connect(gainNode);

    gainNode.connect(audioContext.destination);

    const newAudioMap = new Map(get().audio);
    newAudioMap.set(userId, { analyser, dumy, gainNode });

    set({ audio: newAudioMap, audioContext });

    if (isNewContext) {
      const { audioOutput } = useDeviceStore.getState().device;
      if (audioOutput?.deviceId) {
        get().setOutputDevice(audioOutput.deviceId);
      }
    }
  },
  audio: new Map(),
  audioContext: null,

  removeAudioTrack: (id: string) => {
    const audio = get().audio.get(id);
    if (!audio) {
      return;
    }

    audio.analyser.disconnect();
    audio.gainNode.disconnect();

    audio.dumy.pause();
    audio.dumy.srcObject = null;
    audio.dumy.load();

    const newAudioMap = new Map(get().audio);
    newAudioMap.delete(id);

    set({ audio: newAudioMap });
  },

  resumeAudioContext: async () => {
    const audioContext = get().audioContext;
    if (!audioContext || audioContext.state !== 'suspended') {
      return;
    }

    try {
      await audioContext.resume();
    } catch {}
  },

  setOutputDevice: async (deviceId: string) => {
    const audioContext = get().audioContext as AudioContextWithSink | null;
    if (!audioContext || typeof audioContext.setSinkId !== 'function' || !deviceId) {
      return;
    }

    try {
      await audioContext.setSinkId(deviceId);
    } catch {}
  },
}));
