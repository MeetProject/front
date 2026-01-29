import ParticipantCount from './ParticipantsCount';

export default function Header() {
  return (
    <header className='flex h-16 w-full justify-end px-4 py-3.5'>
      <div className='flex items-center gap-2 px-1'>
        <ParticipantCount />
      </div>
    </header>
  );
}
