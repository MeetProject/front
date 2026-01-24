interface LayoutOptions {
  gap?: number;
  minWidth?: number;
  minHeight?: number;
}

interface LayoutResult {
  cols: number;
  rows: number;
  size: number;
  score: number;
}

const getRatio = (width: number, height: number) => {
  const ratio = width / height;

  if (ratio < 0.7) {
    return 9 / 16;
  }

  if (ratio < 1.2) {
    return 1;
  }
  return 16 / 9;
};

const getLayoutScore = (
  k: number,
  c: number,
  r: number,
  width: number,
  height: number,
  targetRatio: number,
  options: LayoutOptions,
) => {
  const { gap = 8, minHeight = 200, minWidth = 300 } = options;

  const tileW = (width - (c - 1) * gap) / c;
  const tileH = (height - (r - 1) * gap) / r;

  if (tileW < minWidth || tileH < minHeight) {
    return null;
  }

  const currentRatio = tileW / tileH;
  const ratioMatch = Math.min(currentRatio, targetRatio) / Math.max(currentRatio, targetRatio);

  if (ratioMatch < 0.6) {
    return null;
  }

  const isWider = currentRatio > targetRatio;
  const actualW = isWider ? tileH * targetRatio : tileW;
  const actualH = isWider ? tileH : tileW / targetRatio;

  return {
    cols: c,
    rows: r,
    score: actualW * actualH * Math.pow(ratioMatch, 3),
    size: k,
  };
};

const findBestLayoutForK = (
  k: number,
  width: number,
  height: number,
  targetRatio: number,
  options: LayoutOptions,
): LayoutResult | null => {
  const startC = Math.ceil(Math.sqrt(k));
  const range = Array.from({ length: k - startC + 1 }, (_, i) => i + startC);

  return range.reduce<LayoutResult | null>((best, c) => {
    const r = Math.ceil(k / c);
    const layout = getLayoutScore(k, c, r, width, height, targetRatio, options);

    if (!layout || (best && layout.score <= best.score)) {
      return best;
    }

    return layout;
  }, null);
};

export const calculateGridLayout = (totalSize: number, width: number, height: number, options: LayoutOptions = {}) => {
  const targetRatio = getRatio(width, height);

  const finalLayout = Array.from({ length: totalSize }, (_, i) => totalSize - i).reduce<LayoutResult | null>(
    (found, k) => found ?? findBestLayoutForK(k, width, height, targetRatio, options),
    null,
  );

  return {
    cols: finalLayout?.cols ?? 1,
    rows: finalLayout?.rows ?? 1,
    size: finalLayout?.size ?? Math.min(totalSize, 1),
  };
};
