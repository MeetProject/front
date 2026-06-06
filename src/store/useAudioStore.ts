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

    // Safari 등에서 user gesture 밖의 resume()은 reject될 수 있으므로 그래프 구성을 막지 않도록 비동기로 처리한다.
    // 실제 재생 복구는 사용자 제스처 시점의 resumeAudioContext()가 담당한다.
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    const mediaStream = new MediaStream([track]);

    // WebRTC 버그 우회를 위한 더미 오디오(원격 트랙을 Web Audio 그래프로 끌어오기 위한 sink)
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

    // 가청 출력은 AudioContext.destination으로 일원화한다.
    // (MediaStreamDestination + <audio> 경로는 Web Audio 스트림에 대해 HTMLMediaElement.setSinkId가
    //  동작하지 않아 스피커 변경이 불가능했음 -> AudioContext.setSinkId로 전환)
    gainNode.connect(audioContext.destination);

    const newAudioMap = new Map(get().audio);
    newAudioMap.set(userId, { analyser, dumy, gainNode });

    set({ audio: newAudioMap, audioContext });

    // 컨텍스트 최초 생성 시 현재 선택된 출력 장치를 적용한다.
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
