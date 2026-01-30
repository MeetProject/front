import { Profile } from '@/components';
import { cn } from '@/lib/cn';

interface ParticipantTileClusterProps {
  participants: string[];
}

export default function ParticipantTileCluster({ participants }: ParticipantTileClusterProps) {
  const count = participants.length;
  const style = [
    cn(
      count === 1 && 'size-full text-[8px]',
      count === 2 && 'size-[10.88px] self-start text-[8px]',
      count === 3 && 'mb-px size-[13.44px] text-[8px]',
      count >= 4 && 'size-[13.44px] text-[8px]',
    ),
    cn(
      count === 2 && 'size-[10.88px] self-end text-[8px]',
      count === 3 && 'size-[10.88px] text-[8px]',
      count >= 4 && 'mt-1 size-[6.72px] text-[4px]',
    ),
    cn(count === 3 && 'size-[8.32px] text-[5px]', count >= 4 && 'size-2.25 text-[6px]'),
    'size-[10.88px] text-[5px]',
  ];

  return (
    <div
      className={cn(
        'relative flex size-8 items-center justify-center overflow-hidden rounded-full p-1',
        count === 2 ? 'flex-col justify-between p-1.25' : 'flex-wrap content-center gap-px',
      )}
    >
      {participants.slice(0, 4).map((id, i) => (
        <Profile className={style[i]} id={id} key={id} />
      ))}
    </div>
  );
}
