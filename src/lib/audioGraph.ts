import { createAudioContext } from '@/util/audio';

interface AudioNodes {
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
}

export interface AttachedAudio {
  stream: MediaStream;
  analyser: AnalyserNode;
}

let audioContext: AudioContext | null = null;
const nodes = new Map<string, AudioNodes>();

export const attachAudio = (userId: string, track: MediaStreamTrack): AttachedAudio | null => {
  audioContext = audioContext ?? createAudioContext();
  if (!audioContext) {
    return null;
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  const previous = nodes.get(userId);
  if (previous) {
    previous.source.disconnect();
    previous.analyser.disconnect();
  }

  const stream = new MediaStream([track]);
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  nodes.set(userId, { analyser, source });

  return { analyser, stream };
};

export const detachAudio = (userId: string) => {
  const entry = nodes.get(userId);
  if (!entry) {
    return;
  }

  entry.source.disconnect();
  entry.analyser.disconnect();
  nodes.delete(userId);
};

export const resetAudio = () => {
  nodes.forEach(({ analyser, source }) => {
    source.disconnect();
    analyser.disconnect();
  });
  nodes.clear();
};

export const resumeAudioContext = async () => {
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch {}
  }
};
