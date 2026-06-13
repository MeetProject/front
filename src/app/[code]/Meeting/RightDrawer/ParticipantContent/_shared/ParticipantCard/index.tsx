import LocalMuteButton from './LocalMuteButton';
import MicStatus from './MicStatus';

import * as Icon from '@/asset/svg';
import { Profile } from '@/components';

interface ParticipantCardProps {
  userId: string;
  name: string;
  isMe?: boolean;
  option?: {
    audio?: boolean;
  };
}

export default function ParticipantCard({ isMe, name, option, userId }: ParticipantCardProps) {
  return (
    <div className='my-3 flex items-center justify-between'>
      <div className='flex flex-1 items-center gap-4'>
        <Profile className='size-8 text-[16px]' id={userId} isMe={isMe} />
        <div className='text-surface-variant flex-1 items-center text-left'>
          <p>{`${name}${isMe ? ' (나)' : ''}`}</p>
        </div>
      </div>
      {option && (
        <div className='flex items-center'>
          <div className='flex size-12 items-center justify-center'>
            {option.audio && <MicStatus id={userId} isMe={isMe} />}
          </div>
          {!isMe && <LocalMuteButton id={userId} />}
          <button className='hover:bg-action-hover flex size-12 items-center justify-center rounded-full' type='button'>
            <Icon.Menu className='fill-on-surface-dark size-6 rotate-90' />
          </button>
        </div>
      )}
    </div>
  );
}
