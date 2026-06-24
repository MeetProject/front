const FRAME_MS = 33;

interface AudioTickSubscriber {
  getAnalyser: () => AnalyserNode | null;
  onValue: (average: number) => void;
}

const subscribers = new Set<AudioTickSubscriber>();
const latest = new Map<AnalyserNode, number>();
const buffer = new Uint8Array(1024);
const state = { lastTime: 0, rafId: 0 };

const readAverage = (analyser: AnalyserNode): number => {
  const bins = Math.min(analyser.frequencyBinCount, buffer.length);
  if (bins === 0) {
    return 0;
  }

  analyser.getByteFrequencyData(buffer);
  const sum = buffer.subarray(0, bins).reduce((acc, value) => acc + value, 0);
  return sum / bins;
};

const tick = (timestamp: number) => {
  state.rafId = requestAnimationFrame(tick);

  if (timestamp - state.lastTime < FRAME_MS) {
    return;
  }
  state.lastTime = timestamp;
  latest.clear();

  if (document.hidden) {
    subscribers.forEach((subscriber) => subscriber.onValue(0));
    return;
  }

  subscribers.forEach((subscriber) => {
    const analyser = subscriber.getAnalyser();
    if (!analyser) {
      subscriber.onValue(0);
      return;
    }

    const cached = latest.get(analyser);
    const average = cached ?? readAverage(analyser);
    if (cached === undefined) {
      latest.set(analyser, average);
    }
    subscriber.onValue(average);
  });
};

export const subscribeAudioTick = (subscriber: AudioTickSubscriber) => {
  subscribers.add(subscriber);
  if (!state.rafId) {
    state.lastTime = performance.now();
    state.rafId = requestAnimationFrame(tick);
  }

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0 && state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = 0;
      latest.clear();
    }
  };
};

// ticker가 이번 프레임에 이미 읽은 평균값을 재사용한다(없으면 undefined).
export const peekAverage = (analyser: AnalyserNode): number | undefined => latest.get(analyser);

// ticker 구독이 없는 analyser(예: 화면 밖 참가자)의 평균을 직접 측정한다.
export const measureAverage = (analyser: AnalyserNode): number => readAverage(analyser);
