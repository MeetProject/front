import clsx from 'clsx';

import { getHue, getLuminance, getSaturation, parseRGB } from '@/util/color';

interface VideoOffOverlayProps {
  name: string;
  color: string;
}

export default function VideoOffOverlay({ color, name }: VideoOffOverlayProps) {
  const getVideoOffColor = (hex: string) => {
    const { b, g, r } = parseRGB(hex);

    const saturation = getSaturation(r, g, b);
    const hue = getHue(r, g, b);

    return {
      bgInner: `hsl(${hue}, ${Math.min(saturation + 12, 100)}%, 35%)`,
      bgOuter: `hsl(${hue}, ${Math.min(saturation + 8, 100)}%, 22%)`,
      profile: hex,
    };
  };

  const layoutColor = getVideoOffColor(color);
  const isLight = getLuminance(color) >= 0.8;
  return (
    <div
      className={clsx(
        'relative flex size-full items-center justify-center overflow-hidden rounded-xl',
        'bg-[radial-gradient(circle_at_center,var(--bg-inner)_0%,var(--bg-inner)_30%,var(--bg-outer)_100%)]',
      )}
      style={
        {
          '--bg-inner': layoutColor.bgInner,
          '--bg-outer': layoutColor.bgOuter,
        } as React.CSSProperties
      }
    >
      <div
        className={clsx(
          'flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold shadow-lg',
          isLight ? 'text-device-item' : 'text-white',
        )}
        style={{ backgroundColor: color }}
      >
        {name.charAt(0)}
      </div>
    </div>
  );
}
