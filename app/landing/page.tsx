import Link from 'next/link';

import NewMeetingButton from './_components/NewMeetingButton';

export default function Page() {
  return (
    <div className='flex size-full flex-col'>
      <header>헤더</header>
      <div className='relative flex flex-1 items-center justify-center'>
        <div className='max-w-163.75 shrink px-[3em] py-[1em]'>
          <div className='font-googleSans text-4.5xl pb-2 leading-13 font-normal'>
            모든 사용자를 위한 영상 통화 및 화상 회의
          </div>
          <div className='font-googleSans text-1.5xl max-w-120 pb-8 leading-7 font-normal text-gray-600'>
            Project Meet로 어디서나 연결하고 공동작업하고 기념일을 축하할 수 있습니다.
          </div>
          <div className='flex flex-wrap items-center gap-6'>
            <NewMeetingButton />
            <button>참가하기</button>
          </div>
          <div className='mt-8 w-full border-t border-solid border-[#747775] pt-4 text-xs'>
            Project Meet에 관해{' '}
            <Link
              className='border-solid border-[#0B57D5] text-[#0B57D5] hover:border-b'
              href='https://github.com/armd482/meetproejct'
            >
              자세히 알아보세요.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
