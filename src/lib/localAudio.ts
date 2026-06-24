import { createAudioContext } from '@/util/audio';

const FFT_SIZE = 256;

let audioContext: AudioContext | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;

export const createLocalAnalyser = (stream: MediaStream): AnalyserNode | null => {
  releaseLocalAnalyser();

  audioContext = createAudioContext();
  if (!audioContext) {
    return null;
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  analyser = audioContext.createAnalyser();
  analyser.fftSize = FFT_SIZE;

  source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  return analyser;
};

export const releaseLocalAnalyser = () => {
  source?.disconnect();
  analyser?.disconnect();
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close().catch(() => {});
  }

  source = null;
  analyser = null;
  audioContext = null;
};

export const resumeLocalAnalyser = () => {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
};
