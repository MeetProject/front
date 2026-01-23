import CallControlls from './CallControls';
import MeetingAuxControls from './MeetingAuxControls';
import MeetingInfo from './MeetingInfo';

export default function ControlBar() {
  return (
    <div className='grid h-20 w-full grid-cols-[1fr_auto_1fr] items-center px-3 max-[640px]:grid-cols-[minmax(0,1fr)_auto_48px] max-[540px]:grid-cols-[auto_48px]'>
      <MeetingInfo />
      <CallControlls />
      <MeetingAuxControls />
    </div>
  );
}
