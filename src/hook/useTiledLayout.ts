'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';

import useActiveSpeakerDetector from '@/hook/useActiveSpeakerDetector';
import { useActiveSpeakerStore } from '@/store/useActiveSpeakerStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { buildDisplayOrder, calculateGridLayout } from '@/util/layout';

const MAX_STREAM_SIZE = 36;

const useTiledLayout = () => {
  const [layout, setLayout] = useState({ cols: 1, rows: 1, size: 0 });
  const [dims, setDims] = useState({ height: 0, width: 0 });

  const participants = useParticipantStore((state) => state.participants);
  const promoted = useActiveSpeakerStore((state) => state.promoted);

  const hasHiddenParticipants = layout.size > 0 && participants.length + 1 > layout.size;
  useActiveSpeakerDetector(hasHiddenParticipants, Math.max(0, layout.size - 1));

  const handleResize = useCallback((width: number, height: number) => {
    setDims({ height, width });
  }, []);

  useEffect(() => {
    if (dims.width === 0 || dims.height === 0) {
      return;
    }

    const totalNeeded = Math.min(participants.length + 1, MAX_STREAM_SIZE);
    const grid = calculateGridLayout(totalNeeded, dims.width, dims.height, { gap: 12 });

    setLayout(grid);
  }, [participants.length, dims]);

  const gridData = useMemo(() => {
    const { cols, size } = layout;

    const totalCount = participants.length + 1;
    const isOverflow = totalCount > size;

    const displayedCells = isOverflow ? size : totalCount;

    const lastRowItemCount = displayedCells % cols;

    const standardCellsCount = displayedCells - lastRowItemCount;

    const hasOverflowInMainGrid = isOverflow && lastRowItemCount === 0;

    const standardRemoteCount = Math.max(0, standardCellsCount - 1 - (hasOverflowInMainGrid ? 1 : 0));

    const hasOverflowInLastRow = isOverflow && lastRowItemCount > 0;

    const lastRowRemoteCount = Math.max(0, lastRowItemCount - (hasOverflowInLastRow ? 1 : 0));

    const renderedRemoteCount = standardRemoteCount + lastRowRemoteCount;

    const ordered = buildDisplayOrder(participants, promoted, renderedRemoteCount);

    const standardParticipants = ordered.slice(0, standardRemoteCount);
    const lastRowParticipants = ordered.slice(standardRemoteCount, standardRemoteCount + lastRowRemoteCount);

    const overflowCount = participants.length - renderedRemoteCount;
    const overflowUsers = ordered.slice(renderedRemoteCount, renderedRemoteCount + 2);

    return {
      hasOverflowInMainGrid,
      isOverflow,
      lastRowItemCount,
      lastRowParticipants,
      overflowCount,
      overflowUsers,
      standardParticipants,
    };
  }, [participants, promoted, layout]);

  return { gridData, handleResize, layout };
};

export default useTiledLayout;
