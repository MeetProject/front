'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useShallow } from 'zustand/shallow';

import { useParticipantStore } from '@/store/useParticipantStore';
import { calculateGridLayout } from '@/util/layout';

const MAX_STREAM_SIZE = 36;

const useTiledLayout = () => {
  const [layout, setLayout] = useState({ cols: 1, rows: 1, size: 0 });
  const [dims, setDims] = useState({ height: 0, width: 0 });

  const { participants } = useParticipantStore(useShallow((state) => ({ participants: state.participants })));

  const handleResize = useCallback((width: number, height: number) => {
    setDims({ height, width });
  }, []);

  useEffect(() => {
    if (dims.width === 0 || dims.height === 0) return;

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
    const standardParticipants = participants.slice(0, standardRemoteCount);

    const hasOverflowInLastRow = isOverflow && lastRowItemCount > 0;

    const lastRowRemoteCount = Math.max(0, lastRowItemCount - (hasOverflowInLastRow ? 1 : 0));
    const lastRowParticipants = participants.slice(standardRemoteCount, standardRemoteCount + lastRowRemoteCount);

    const renderedParticipantsCount = standardParticipants.length + lastRowParticipants.length;
    const overflowCount = participants.length - renderedParticipantsCount;
    const overflowUsers = participants.slice(renderedParticipantsCount, renderedParticipantsCount + 2);

    return {
      hasOverflowInMainGrid,
      isOverflow,
      lastRowItemCount,
      lastRowParticipants,
      overflowCount,
      overflowUsers,
      standardParticipants,
    };
  }, [participants, layout]);

  return { gridData, handleResize, layout };
};

export default useTiledLayout;
