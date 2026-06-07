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
