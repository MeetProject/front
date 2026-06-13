import { PresentationLayoutType } from '@/types/components';

export const buildDisplayOrder = (participants: string[], promoted: string[], capacity: number): string[] => {
  if (capacity <= 0 || promoted.length === 0 || participants.length <= capacity) {
    return participants;
  }

  const visibleSet = new Set(participants.slice(0, capacity));
  const hiddenSpeakers = promoted.filter((id) => !visibleSet.has(id) && participants.includes(id));
  if (hiddenSpeakers.length === 0) {
    return participants;
  }

  const promotedSet = new Set(promoted);
  const result = [...participants];

  hiddenSpeakers.forEach((speaker) => {
    const evictIdx = result.findLastIndex((id, index) => index < capacity && !promotedSet.has(id));
    if (evictIdx === -1) {
      return;
    }

    const speakerIdx = result.indexOf(speaker);
    [result[evictIdx], result[speakerIdx]] = [result[speakerIdx], result[evictIdx]];
  });

  const changed = result.some((id, index) => id !== participants[index]);
  return changed ? result : participants;
};

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
  const { gap = 8, minHeight = 200, minWidth = 200 } = options;

  const tileW = (width - (c - 1) * gap) / c;
  const tileH = (height - (r - 1) * gap) / r;

  if (tileW < minWidth || tileH < minHeight) {
    return null;
  }

  const currentRatio = tileW / tileH;
  const ratioMatch = Math.min(currentRatio, targetRatio) / Math.max(currentRatio, targetRatio);

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
  const range = Array.from({ length: k }, (_, i) => i + 1);

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

export const calculatePresentationLayout = (
  participantCount: number,
  width: number,
  height: number,
  options: LayoutOptions = {},
): PresentationLayoutType => {
  const gap = options.gap ?? 8;

  if (width < 600) {
    return {
      mainArea: { height, width },
      mode: 'full',
      participantArea: { cols: 0, height: 0, rows: 0, size: 0, width: 0 },
    };
  }

  if (width > 1000) {
    const sidebarWidth = Math.min(Math.max(width * 0.25, 200), 320);
    const mainWidth = width - sidebarWidth - gap;

    const grid = calculateGridLayout(participantCount, sidebarWidth, height, {
      ...options,
      minWidth: 200,
    });

    return {
      mainArea: { height, width: mainWidth },
      mode: 'sidebar',
      participantArea: { height, width: sidebarWidth, ...grid },
    };
  }
  const topHeight = 150;
  const mainHeight = height - topHeight - gap;

  const grid = calculateGridLayout(participantCount, width, topHeight, {
    ...options,
    minHeight: 100,
  });

  return {
    mainArea: { height: mainHeight, width },
    mode: 'top',
    participantArea: { height: topHeight, width, ...grid },
  };
};

const measureContext: { current: CanvasRenderingContext2D | null } = { current: null };

const getMeasureContext = () => {
  measureContext.current ??= document.createElement('canvas').getContext('2d');
  return measureContext.current;
};

export const getTruncatedWords = (
  words: string[],
  suffix: string,
  maxWidth: number,
  font: string = "12px 'Google Sans', Roboto, Arial, sans-serif",
) => {
  const context = getMeasureContext();
  if (words.length === 0 || !context) {
    return { count: 0, text: '' };
  }

  context.font = font;
  const suffixWidth = context.measureText(suffix).width;

  const { count, text } = words.reduce(
    (acc, word, i) => {
      if (acc.isOver) {
        return acc;
      }
      const nextText = acc.text ? [acc.text, word].join(', ') : word;
      const isOver = context.measureText(nextText).width + suffixWidth + 10 >= maxWidth;

      if (isOver) {
        return { count: acc.count, isOver: isOver, text: `${acc.text}${suffix}` };
      }
      return { count: i + 1, isOver: false, text: nextText };
    },
    { count: 0, isOver: false, text: '' },
  );

  return { count, text };
};
