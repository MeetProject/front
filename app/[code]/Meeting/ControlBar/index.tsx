import clsx from 'clsx';

import CallControlls from './CallControls';
import MeetingAuxControls from './MeetingAuxControls';
import MeetingInfo from './MeetingInfo';

export default function ControlBar() {
  return (
    <div
      className={clsx(
        'grid h-20 w-full grid-cols-[1fr_auto_1fr] items-center px-3',
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
