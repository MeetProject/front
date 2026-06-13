'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import useActiveSpeakerDetector from '@/hook/useActiveSpeakerDetector';
import { useActiveSpeakerStore } from '@/store/useActiveSpeakerStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { PresentationLayoutType } from '@/types/components';
import { buildDisplayOrder, calculatePresentationLayout } from '@/util/layout';

const useStagedLayout = () => {
  const [layout, setLayout] = useState<PresentationLayoutType>({
    mainArea: { height: 0, width: 0 },
    mode: null,
    participantArea: { cols: 0, height: 0, rows: 0, size: 0, width: 0 },
  });
  const [dims, setDims] = useState({ height: 0, width: 0 });

  const participants = useParticipantStore((state) => state.participants);
  const promoted = useActiveSpeakerStore((state) => state.promoted);

  const { size } = layout.participantArea;
  const isOverflow = size > 0 && participants.length + 1 > size;
  useActiveSpeakerDetector(isOverflow, Math.max(0, size - 1));

  const handleResize = useCallback((width: number, height: number) => {
    setDims({ height, width });
  }, []);

  useEffect(() => {
    if (dims.width === 0 || dims.height === 0) {
      return;
    }

    const currentLayout = calculatePresentationLayout(participants.length + 1, dims.width, dims.height, { gap: 12 });
    setLayout(currentLayout);
  }, [participants.length, dims]);

  const participantData = useMemo(() => {
    if (size <= 0) {
      return null;
    }

    const maxVisible = size - 1;
    const capacity = Math.max(0, maxVisible - (participants.length > maxVisible ? 1 : 0));

    const ordered = buildDisplayOrder(participants, promoted, capacity);
    const visible = ordered.slice(0, capacity);
    const remainingCount = participants.length - visible.length;

    return {
      hasOverflow: remainingCount > 0,
      overflowUsers: ordered.slice(visible.length, visible.length + 2),
      remainingCount,
      visible,
    };
  }, [participants, promoted, size]);

  return { handleResize, layout, participantData };
};

export default useStagedLayout;
