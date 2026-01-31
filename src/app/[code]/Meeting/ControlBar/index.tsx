import CallControlls from './CallControls';
import MeetingAuxControls from './MeetingAuxControls';
import MeetingInfo from './MeetingInfo';

import { cn } from '@/lib/cn';

export default function ControlBar() {
  return (
    <div
      className={cn(
        'z-3 grid h-20 w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center px-3',
        'max-[540px]:gap-4px max-[640px]:flex max-[540px]:items-center max-[540px]:justify-center',
        'max-[360px]:justify-start',
      )}
    >
      <MeetingInfo />
      <CallControlls />
      <MeetingAuxControls />
    </div>
  );
}
