export interface SpeakerDetectionState {
  lastActive: Map<string, number>; // userId -> 마지막으로 "발화"로 인정된 시각
  sustain: Map<string, number>; // userId -> 연속 발화 누적 시간(ms)
}

export interface SpeakerDetectionConfig {
  threshold: number; // 평균 주파수 에너지 임계값
  sustainMs: number; // 이 시간 이상 연속 발화해야 발화로 인정
  cooldownMs: number; // 마지막 발화 후 이 시간까지 승격 유지
  intervalMs: number; // 틱 간격(누적 단위)
}

/**
 * 한 틱의 발화 판정 정책(순수 함수). state(Map)를 갱신하고 승격 대상 id 목록을 반환한다.
 * - sustain: 블립(짧은 소음) 무시
 * - cooldown: 잠깐 멈춰도 일정 시간 승격 유지(flapping 방지)
 * - 최근 발화 순 정렬 후 maxSpeakers개로 제한
 */
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

  // 더 이상 오디오 정보가 없는(퇴장한) 사용자 정리
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
