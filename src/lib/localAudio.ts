import { createAudioContext } from '@/util/audio';

const FFT_SIZE = 256;

const state: {
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
  source: MediaStreamAudioSourceNode | null;
} = { analyser: null, audioContext: null, source: null };

export const createLocalAnalyser = (stream: MediaStream): AnalyserNode | null => {
  releaseLocalAnalyser();

  const audioContext = createAudioContext();
  state.audioContext = audioContext;
  if (!audioContext) {
    return null;
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = FFT_SIZE;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  state.analyser = analyser;
  state.source = source;

  return analyser;
};

export const releaseLocalAnalyser = () => {
  state.source?.disconnect();
  state.analyser?.disconnect();
  if (state.audioContext && state.audioContext.state !== 'closed') {
    state.audioContext.close().catch(() => {});
  }

  state.analyser = null;
  state.audioContext = null;
  state.source = null;
};

export const resumeLocalAnalyser = () => {
  const { audioContext } = state;
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
};
