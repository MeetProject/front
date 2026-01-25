import clsx from 'clsx';

import * as Icon from '@/asset/svg';

interface NameTagProps {
  isHandsUp: boolean;
  name: string;
}

export default function NameTag({ isHandsUp, name }: NameTagProps) {
  return (
    <div className={clsx('absolute bottom-0 left-0 px-2 pb-2')}>
      <div
        className={`flex h-8 items-center justify-start gap-2 overflow-hidden rounded-2xl pr-3 pl-2 ${isHandsUp ? 'animate-expand-pill origin-bottom bg-[rgb(109,213,140)]' : 'bg-transparent'} `}
      >
        <div className={`shrink-0 ${isHandsUp && 'animate-wave-hands'}`}>
          {isHandsUp && <Icon.FrontHand fill='#0a3818' height={16} width={16} />}
        </div>
        <div className='shrink'>
          <p className={clsx('font-google-sans font-medium', isHandsUp ? 'text-[#0a3818]' : 'text-[rgb(255,255,255)]')}>
            {name}
          </p>
        </div>
      </div>
    </div>
  );
}
