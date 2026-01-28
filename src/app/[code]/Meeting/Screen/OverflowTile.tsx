import { Profile } from '@/components';

interface OverflowTileProps {
  user: string[];
  count: number;
}

export default function OverflowTile({ count, user }: OverflowTileProps) {
  return (
    <div className='itesm-center bg-state-layer flex size-full flex-col justify-center rounded-xl'>
      <div className='flex items-center justify-center'>
        {user.map((id, i) => (
          <Profile
            className={i !== 0 ? 'border-state-layer relative -left-1 size-10 border-2 text-xl' : undefined}
            id={id}
            key={id}
          />
        ))}
      </div>
      {count > 0 && <div className='mt-1 text-center text-xs text-white'>{`다른 참여자 ${count}명`}</div>}
    </div>
  );
}
