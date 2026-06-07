'use client';

import { cn } from '@/lib/cn';

interface CategoryButtonProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  name: string;
  isActive: boolean;
  onSelect: () => void;
}

export default function CategoryButton({ icon: IconComponent, isActive, name, onSelect }: CategoryButtonProps) {
  return (
    <button
      aria-selected={isActive}
      className={cn(
        'group relative flex h-12 w-full items-center gap-3 rounded-r-full px-6 transition-all',
        isActive ? 'bg-primary-ghost z-10 hover:shadow-md' : 'hover:bg-surface-bright bg-white',
      )}
      type='button'
      onClick={onSelect}
    >
      <IconComponent
        className={cn('transition-colors', isActive ? 'fill-primary-vivid' : 'fill-on-surface-muted')}
        height={24}
        width={24}
      />
      <span className={cn('max-[640px]:hidden', isActive ? 'text-primary-dark font-medium' : 'text-on-surface-muted')}>
        {name}
      </span>
    </button>
  );
}
