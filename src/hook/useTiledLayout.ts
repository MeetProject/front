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
    if (size === 0) {
      return null;
    }

    const totalCount = participants.length + 1;
    const isOverflow = totalCount > size;
    const lastRowStartIndex = Math.max(0, size - (size % cols || cols));
    const standardParticipants = participants.slice(0, Math.max(0, lastRowStartIndex - 1));

    const lastRowEndIndex = isOverflow ? size - 1 : size;
    const lastRowParticipants = participants.slice(
      Math.max(0, lastRowStartIndex - 1),
      Math.max(0, lastRowEndIndex - 1),
    );

    const overflowCount = participants.length - size;
    const overflowUsers = participants.slice(size - 2, size);

    return {
      isOverflow,
      lastRowItemCount: lastRowParticipants.length + (isOverflow ? 1 : 0),
      lastRowParticipants,
      overflowCount,
      overflowUsers,
      standardParticipants,
    };
  }, [participants, layout]);

  return { gridData, handleResize, layout };
};

export default useTiledLayout;
