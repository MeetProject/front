import CallControlls from './CallControls';
import MeetingAuxControls from './MeetingAuxControls';
import MeetingInfo from './MeetingInfo';

export default function ControlBar() {
  return (
    <div className='grid h-20 w-full grid-cols-[1fr_auto_1fr] items-center px-3'>
      <MeetingInfo />
      <CallControlls />
      <MeetingAuxControls />
    </div>
  );
}
