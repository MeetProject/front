'use client';

import { useRouter } from 'next/navigation';

import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';

export default function CallEndButton() {
  const router = useRouter();
  const handleButtonClick = () => {
    router.push('/');
  };
  return (
    <ButtonTag align='center' name='통화에서 나가기' position='top'>
      <button
        className='flex h-12 w-18 items-center justify-center rounded-3xl bg-[rgb(220,54,46)] hover:bg-[rgb(224,73,64)]'
        type='button'
        onClick={handleButtonClick}
      >
        <Icon.CallEnd fill='#ffffff' height={24} width={24} />
      </button>
    </ButtonTag>
  );
}
