'use client';

import * as Icon from '@/asset/svg';
import { cn } from '@/lib/cn';
import { useInteractionStore } from '@/store/useInteractionStore';
import { useParticipantStore } from '@/store/useParticipantStore';
import { useUserInfoStore } from '@/store/useUserInfoStore';

interface NameTagProps {
  id: string;
  isMe?: boolean;
}

export default function NameTag({ id, isMe }: NameTagProps) {
  const userName = useUserInfoStore((state) => state.userName);
  const isHandsUp = useInteractionStore((state) => state.handsUp.has(id));
  const name = useParticipantStore((state) => state.info.get(id)?.name ?? '');
  return (
    <div className={cn('absolute bottom-0 left-0 px-2 pb-2')}>
      <div
        className={`flex h-8 items-center justify-start gap-2 overflow-hidden rounded-2xl pr-3 pl-2 ${isHandsUp ? 'animate-expand-pill bg-success-subtle origin-bottom' : 'bg-transparent'} `}
      >
        <div className={`shrink-0 ${isHandsUp && 'animate-wave-hands'}`}>
          {isHandsUp && <Icon.FrontHand className='fill-success-deep' height={16} width={16} />}
        </div>
        <div className='shrink'>
          <p className={cn('font-google-sans font-medium', isHandsUp ? 'text-success-deep' : 'text-on-surface-white')}>
            {isMe ? userName : name}
          </p>
        </div>
      </div>
    </div>
  );
}
