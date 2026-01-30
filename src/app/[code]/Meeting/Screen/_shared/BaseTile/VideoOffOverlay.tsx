import { useShallow } from 'zustand/shallow';

import { Profile } from '@/components';
import { cn } from '@/lib/cn';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';
import { getHue, getSaturation, parseRGB } from '@/util/color';

interface VideoOffOverlayProps {
  id: string;
  isMe?: boolean;
}

export default function VideoOffOverlay({ id, isMe }: VideoOffOverlayProps) {
  const userInfo = useUserInfoStore(
    useShallow((state) => ({
      userColor: state.userColor,
      userName: state.userName,
    })),
  );
  const info = useParticipantStore((state) => state.info.get(id));

  const getVideoOffColor = (hex: string) => {
    const { b, g, r } = parseRGB(hex);

    const saturation = getSaturation(r, g, b);
    const hue = getHue(r, g, b);

    return {
      bgInner: `hsl(${hue}, ${Math.min(saturation + 12, 100)}%, 35%)`,
      bgOuter: `hsl(${hue}, ${Math.min(saturation + 8, 100)}%, 22%)`,
    };
  };

  const layoutColor = getVideoOffColor(isMe ? (userInfo.userColor ?? '') : (info?.color ?? ''));
  return (
    <div
      className={cn(
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
      <Profile className='size-24 text-3xl' id={id} isMe={isMe} />
    </div>
  );
}
