import Link from 'next/link';
import { PropsWithChildren } from 'react';

export default function StyleLink({ children }: PropsWithChildren) {
  return (
    <Link className='text-primary-dark underline' href='https://github.com/MeetProject'>
      {children}
    </Link>
  );
}
