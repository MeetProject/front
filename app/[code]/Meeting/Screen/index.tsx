'use client';

import GridLayout from './GridLayout';

export default function Screen() {
  const screenStream = null;

  if (screenStream) {
    return;
  }

  const participants = Array.from({ length: 23 }, (_, i) => `user ${i}`);
  return <GridLayout participants={participants} />;
}
