import { create } from 'zustand';

import { AppData } from '@/types/session';
import { createAudioContext } from '@/util/audio';

interface ConsumerResult {
  appData: AppData;
  track: MediaStreamTrack;
}

interface AudioEntry {
  stream: MediaStream;
  analysisStream: MediaStream;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
}

interface AudioState {
  audio: Map<string, AudioEntry>;
  audioContext: AudioContext | null;
  addAudioTrack: (trackInfo: ConsumerResult) => void;
  removeAudioTrack: (id: string) => void;
  reset: () => void;
  resumeAudioContext: () => Promise<void>;
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
      previous.analysisStream.getTracks().forEach((t) => t.stop());
    }

    const stream = new MediaStream([track]);
    const analysisStream = new MediaStream([track.clone()]);
    const source = audioContext.createMediaStreamSource(analysisStream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    const newAudioMap = new Map(get().audio);
    newAudioMap.set(userId, { analyser, analysisStream, source, stream });

    set({ audio: newAudioMap, audioContext });
  },
  audio: new Map(),
  audioContext: null,

  removeAudioTrack: (id: string) => {
    const entry = get().audio.get(id);
    if (!entry) {
      return;
    }

    const { analyser, analysisStream, source } = entry;

    source.disconnect();
    analyser.disconnect();
    analysisStream.getTracks().forEach((t) => t.stop());

    const newAudioMap = new Map(get().audio);
    newAudioMap.delete(id);

    set({ audio: newAudioMap });
  },

  reset: () => {
    get().audio.forEach(({ analyser, source }) => {
      source.disconnect();
      analyser.disconnect();
    });
    set({ audio: new Map() });
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
