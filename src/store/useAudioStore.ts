import { create } from 'zustand';

import { AppData } from '@/types/session';
import { createAudioContext } from '@/util/audio';

interface ConsumerResult {
  appData: AppData;
  track: MediaStreamTrack;
}

interface AudioEntry {
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
}

interface AudioState {
  audio: Map<string, AudioEntry>;
  audioContext: AudioContext | null;
  addAudioTrack: (trackInfo: ConsumerResult) => void;
  removeAudioTrack: (id: string) => void;
  resumeAudioContext: () => Promise<void>;
  reset: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  addAudioTrack: (trackInfo) => {
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
    }

    const stream = new MediaStream([track]);
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const newAudioMap = new Map(get().audio);
    newAudioMap.set(userId, { analyser, source, stream });

    set({ audio: newAudioMap, audioContext });
  },
  audio: new Map(),
  audioContext: null,

  removeAudioTrack: (id: string) => {
    const entry = get().audio.get(id);
    if (!entry) {
      return;
    }

    const { analyser, source } = entry;

    source.disconnect();
    analyser.disconnect();

    const newAudioMap = new Map(get().audio);
    newAudioMap.delete(id);

    set({ audio: newAudioMap });
  },

  reset: () => {
    const { audio, audioContext } = get();

    audio.forEach(({ analyser, source }) => {
      source.disconnect();
      analyser.disconnect();
    });

    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
    }

    set({ audio: new Map(), audioContext: null });
  },

  resumeAudioContext: async () => {
    const audioContext = get().audioContext;
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch {}
    }
  },
}));
