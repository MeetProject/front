'use client';

import { useCallback, useState, useMemo } from 'react';

import { useParticipantStore } from '@/store/useParticipantStore';
import { PresentationLayoutType } from '@/types/components';
import { calculatePresentationLayout } from '@/util/layout';

const useStagedLayout = () => {
  const [layout, setLayout] = useState<PresentationLayoutType>({
    mainArea: { height: 0, width: 0 },
    mode: null,
    participantArea: { cols: 0, height: 0, rows: 0, size: 0, width: 0 },
  });

  const participants = useParticipantStore((state) => state.participants);

  const handleResize = useCallback(
    (width: number, height: number) => {
      const currentLayout = calculatePresentationLayout(participants.length, width, height, { gap: 12 });
      setLayout(currentLayout);
    },
    [participants.length],
  );

  const participantData = useMemo(() => {
    const { size } = layout.participantArea;
    if (size < 0) {
      return null;
    }

    const maxVisible = size - 1;
    const visible = participants.slice(0, maxVisible - (participants.length > maxVisible ? 1 : 0));
    const remainingCount = participants.length - visible.length;

    return {
      hasOverflow: remainingCount > 0,
      overflowUsers: participants.slice(visible.length, visible.length + 2),
      remainingCount,
      visible,
    };
  }, [participants, layout.participantArea]);

  return { handleResize, layout, participantData };
};

export default useStagedLayout;
