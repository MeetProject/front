export const createAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  return AudioContextClass ? new AudioContextClass() : null;
};

interface StreamAnalyser {
  audioContext: AudioContext;
  analyser: AnalyserNode;
  source: MediaStreamAudioSourceNode;
}

export const createStreamAnalyser = (stream: MediaStream, fftSize = 256): StreamAnalyser | null => {
  if (stream.getAudioTracks().length === 0) {
    return null;
  }

  const audioContext = createAudioContext();
  if (!audioContext) {
    return null;
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  return { analyser, audioContext, source };
};

export const mapBarHeight = (value: number): number => {
  const THRESHOLD = 3;
  if (value <= THRESHOLD) {
    return 0;
  }

  const MAX_INPUT = 30;
  const MAX_DISPLAY_HEIGHT = 12;

  const normalized = Math.min((value - THRESHOLD) / (MAX_INPUT - THRESHOLD), 1);
  return Math.pow(normalized, 1.2) * MAX_DISPLAY_HEIGHT;
};

export const mapBarWidth = (value: number): number => Math.min(value * 2.2, 100);

export interface SpeakerDetectionState {
  lastActive: Map<string, number>;
  sustain: Map<string, number>;
}

export interface SpeakerDetectionConfig {
  threshold: number;
  sustainMs: number;
  cooldownMs: number;
  intervalMs: number;
}

export const resolveActiveSpeakers = (
  volumes: Map<string, number>,
  state: SpeakerDetectionState,
  now: number,
  maxSpeakers: number,
  config: SpeakerDetectionConfig,
): string[] => {
  const { cooldownMs, intervalMs, sustainMs, threshold } = config;
  const { lastActive, sustain } = state;

  volumes.forEach((avg, userId) => {
    if (avg > threshold) {
      const next = (sustain.get(userId) ?? 0) + intervalMs;
      sustain.set(userId, next);
      if (next >= sustainMs) {
        lastActive.set(userId, now);
      }
    } else {
      sustain.set(userId, 0);
    }
  });

  lastActive.forEach((_, id) => {
    if (!volumes.has(id)) {
      lastActive.delete(id);
      sustain.delete(id);
    }
  });

  return [...lastActive.entries()]
    .filter(([, t]) => now - t < cooldownMs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxSpeakers)
    .map(([id]) => id);
};
