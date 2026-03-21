'use client';

import { useRouter } from 'next/navigation';

import * as Icon from '@/asset/svg';
import { ButtonTag } from '@/components';
import { useWebrtcStore } from '@/store/useWebrtcStore';

export default function CallEndButton() {
  const router = useRouter();
  const handleButtonClick = () => {
    useWebrtcStore.setState({ isExistRoom: true });
    router.push('/');
  };
  return (
    <ButtonTag align='center' name='통화에서 나가기' position='top'>
      <button
        className='bg-error-base hover:bg-error-hover flex h-12 w-18 items-center justify-center rounded-3xl'
        type='button'
        onClick={handleButtonClick}
      >
        <Icon.CallEnd className='fill-white' height={24} width={24} />
      </button>
    </ButtonTag>
  );
}
