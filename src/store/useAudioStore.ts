import { create } from 'zustand';

import { useDeviceStore } from '@/store/useDeviceStore';
import { AppData } from '@/types/webRtc';
import { canSelectOutputDevice } from '@/util/env';

interface ConsumerResult {
  appData: AppData;
  track: MediaStreamTrack;
}

type MediaElementWithSink = HTMLAudioElement & { setSinkId?: (deviceId: string) => Promise<void> };

interface AudioEntry {
  // 말하기 표시(레벨 측정)용 - 출력 노드에는 연결하지 않는다.
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode;
  // 실제 출력: 참가자별 <audio> 엘리먼트 직접 재생(Google Meet 방식). setSinkId로 출력 장치 전환.
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

// Safari/macOS 등 setSinkId가 불안정한 환경에서는 호출하지 않고 시스템 기본 출력을 따른다.
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

    const audioContext = get().audioContext ?? new (window.AudioContext || (window as any).webkitAudioContext)();
    if (!audioContext) {
      return;
    }

    // Safari 등에서 user gesture 밖의 resume()은 reject될 수 있으므로 막지 않도록 비동기 처리한다.
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    const stream = new MediaStream([track]);

    // 출력: 참가자별 <audio> 엘리먼트로 원격 스트림을 직접 재생한다(setSinkId로 출력 장치 전환 가능).
    const element = new window.Audio() as MediaElementWithSink;
    element.srcObject = stream;
    element.autoplay = true;

    const { audioOutput } = useDeviceStore.getState().device;
    await applySinkId(element, audioOutput?.deviceId);
    // 자동재생이 막히면 resumeAudioContext()(사용자 제스처)에서 재생한다.
    element.play().catch(() => {});

    // 측정: 말하기 표시용 analyser. 출력에는 연결하지 않는다(실제 소리는 위 element가 담당).
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

    // 자동재생 정책으로 막혔던 출력 엘리먼트를 사용자 제스처 시점에 재생한다.
    get().audio.forEach((entry) => entry.element.play().catch(() => {}));
  },

  setOutputDevice: async (deviceId: string) => {
    await Promise.all(Array.from(get().audio.values()).map((entry) => applySinkId(entry.element, deviceId)));
  },
}));
