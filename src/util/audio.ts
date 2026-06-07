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
