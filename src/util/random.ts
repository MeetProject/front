const getRandomValue = (start: number, end: number) => Math.floor(Math.random() * (end - start) + start);

export const getRandomHexColor = (): string => {
  const HEX = '0123456789abcdef';
  const rr = `${HEX[getRandomValue(0, 15)]}${HEX[getRandomValue(0, 15)]}`;
  const gg = `${HEX[getRandomValue(0, 15)]}${HEX[getRandomValue(0, 15)]}`;
  const bb = `${HEX[getRandomValue(0, 15)]}${HEX[getRandomValue(0, 15)]}`;

  return `#${rr}${gg}${bb}`;
};
