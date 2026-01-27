'use client';

import StagedLayout from './StagedLayout';
import TiledLayout from './TiledLayout';

export default function Screen() {
  const screenStream = 1;

  if (screenStream) {
    return <StagedLayout />;
  }
  return <TiledLayout />;
}
