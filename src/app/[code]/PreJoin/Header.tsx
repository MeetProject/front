import Link from 'next/link';

import * as Icon from '@/asset/svg';

export default function Header() {
  return (
    <header className='relative w-full p-4'>
      <Link className='flex items-center gap-2 whitespace-nowrap' href='/'>
        <Icon.Logo height={36} width={36} />
        <p className='text-1.5xl font-semibold text-gray-600'>Project</p>
        <p className='text-1.5xl font-medium text-gray-600'>Meet</p>
      </Link>
    </header>
  );
}
