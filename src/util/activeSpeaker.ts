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
