import clsx from 'clsx';

import { Profile } from '@/components';

interface OverflowTileProps {
  user: string[];
  count: number;
}

export default function OverflowTile({ count, user }: OverflowTileProps) {
  return (
    <div className='@container-size flex size-full min-h-0 min-w-0 items-center justify-center'>
      <div className='bg-state-layer flex size-full max-h-[calc(100cqw*4/3)] max-w-[calc(100cqh*16/9)] flex-col items-center justify-center rounded-xl'>
        <div className='flex items-center justify-center'>
          {user.map((id, i) => (
            <Profile
              className={clsx('border-state-layer relative size-10 border-2 text-xl', i !== 0 && '-left-2')}
              id={id}
              key={id}
            />
          ))}
        </div>
        {count > 0 && <div className='mt-3 text-center text-xs text-white'>{`다른 참여자 ${count}명`}</div>}
      </div>
    </div>
  );
}
