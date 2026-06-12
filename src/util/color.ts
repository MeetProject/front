export const parseRGB = (hex: string) => {
  const [r, g, b] = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((x) => parseInt(x, 16));
  return { b, g, r };
};

export const getHue = (r: number, g: number, b: number) => {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const d = max - min;
  if (d === 0) {
    return 0;
  }

  const segment = {
    [b]: (r - g) / d + 4,
    [g]: (b - r) / d + 2,
    [r]: (g - b) / d + (g < b ? 6 : 0),
  };

  return Math.round(segment[max] * 60);
};

export const getSaturation = (r: number, g: number, b: number) => {
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  const max = Math.max(sR, sG, sB);
  const min = Math.min(sR, sG, sB);

  const d = max - min;
  const l = (max + min) / 2;

  if (d === 0) {
    return 0;
  }

  const s = l > 0.5 ? d / (2 - 2 * l) : d / (2 * l);

  return Math.round(s * 100);
};

export const getLuminance = (hex: string) => {
  const { b, g, r } = parseRGB(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const getRandomValue = (start: number, end: number) => Math.floor(Math.random() * (end - start) + start);

export const hslToHex = (h: number, s: number, l: number): string => {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const channel = (n: number) => {
    const value = lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${channel(0)}${channel(8)}${channel(4)}`;
};

export const getRandomHexColor = (): string => {
  const hue = getRandomValue(0, 360);
  const saturation = getRandomValue(45, 75);
  const lightness = getRandomValue(35, 60);

  return hslToHex(hue, saturation, lightness);
};
