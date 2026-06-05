import { create } from 'zustand';

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

interface AudioState {
  audio: Map<String, AudioContextState>;
  audioContext: AudioContext | null;
  addAudioTrack: (trackInfo: ConsumerResult) => Promise<void>;
  removeAudioTrack: (id: string) => void;
  resumeAudioContext: () => Promise<void>;
  audioDestination: MediaStreamAudioDestinationNode | null;
  audioStream: MediaStream | null;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  addAudioTrack: async (trackInfo) => {
    const {
      appData: { userId },
      track,
    } = trackInfo;

    const audioContext = get().audioContext ?? new (window.AudioContext || (window as any).webkitAudioContext)();

    if (!audioContext) {
      return;
    }

    // Safari 등에서 user gesture 밖의 resume()은 reject될 수 있으므로 그래프 구성을 막지 않도록 비동기로 처리한다.
    // 실제 재생 복구는 사용자 제스처 시점의 resumeAudioContext()가 담당한다.
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    const destination = get().audioDestination ?? audioContext.createMediaStreamDestination();
    const mediaStream = new MediaStream([track]);

    // WebRTC 버그 우회를 위한 더미 오디오
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

    gainNode.connect(destination);

    const newAudioMap = new Map(get().audio);
    newAudioMap.set(userId, { analyser, dumy, gainNode });

    set({
      audio: newAudioMap,
      audioContext,
      audioDestination: destination,
      audioStream: destination.stream,
    });
  },
  audio: new Map(),
  audioContext: null,
  audioDestination: null,
  audioStream: null,

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
}));
