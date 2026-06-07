import { PresentationLayoutType } from '@/types/components';

/**
 * 활성 화자(promoted)를 가시 영역(capacity) 안으로 끌어오되, 슬롯 스왑으로 위치 변동을 최소화한다.
 * - 가려진 활성 화자를, 가시 영역의 "비활성(promoted 아님) 슬롯"과 자리만 교환한다.
 * - 변경이 없으면 원본 배열 참조를 그대로 반환해 불필요한 리렌더를 막는다.
 */
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
  let changed = false;

  for (const speaker of hiddenSpeakers) {
    // 가시 영역 뒤쪽부터 비활성 슬롯을 찾아 화자와 자리 교환
    let evictIdx = -1;
    for (let i = capacity - 1; i >= 0; i--) {
      if (!promotedSet.has(result[i])) {
        evictIdx = i;
        break;
      }
    }
    if (evictIdx === -1) {
      break; // 가시 슬롯이 전부 활성 화자 → 더 끌어올 수 없음
    }

    const speakerIdx = result.indexOf(speaker);
    [result[evictIdx], result[speakerIdx]] = [result[speakerIdx], result[evictIdx]];
    changed = true;
  }

  // 실제 교체가 없었다면 원본 참조를 반환해 불필요한 리렌더를 막는다.
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

export const getTruncatedWords = (
  words: string[],
  suffix: string,
  maxWidth: number,
  font: string = "12px 'Google Sans', Roboto, Arial, sans-serif",
) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (words.length === 0 || !context) {
    return { count: 0, text: '' };
  }

  context.font = font;
  const sufficWidth = context.measureText(suffix).width;

  const { count, text } = words.reduce(
    (acc, word, i) => {
      if (acc.isOver) {
        return acc;
      }
      const nextText = acc.text ? [acc.text, word].join(', ') : word;
      const isOver = context.measureText(nextText).width + sufficWidth + 10 >= maxWidth;

      if (isOver) {
        return { count: acc.count, isOver: isOver, text: `${acc.text}${suffix}` };
      }
      return { count: i + 1, isOver: false, text: nextText };
    },
    { count: 0, isOver: false, text: '' },
  );

  return { count, text };
};
