import { cn } from '@/lib/cn';
import { getLuminance } from '@/util/color';

interface ProfileIconProps {
  name: string;
  color: string;
  className?: string;
}

export default function ProfileIcon({ className, color, name }: ProfileIconProps) {
  const isLight = getLuminance(color) >= 0.65;
  return (
    <div
      className={cn(
        'flex size-10 items-center justify-center overflow-hidden rounded-full text-center text-xl shadow-lg',
        isLight ? 'text-outline-dark' : 'text-white',
        className,
      )}
      style={{ background: color }}
    >
      {[...name].slice(0, 2).join('')}
    </div>
  );
}
