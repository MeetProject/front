'use client';

import StagedLayout from './StagedLayout';
import TiledLayout from './TiledLayout';

export default function Screen() {
  const screenStream = null;

  if (screenStream) {
    return <StagedLayout />;
  }
  return <TiledLayout />;
}
