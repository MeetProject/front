import * as Icon from '@/asset/svg';

interface LoadingProperties {
  isPending: boolean;
}

function Loading({ isPending }: LoadingProperties) {
  if (!isPending) {
    return null;
  }
  return (
    <div
      className='fixed top-0 left-0 z-50 flex size-full items-center justify-center'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <Icon.Loading className='animate-spinner block size-6' fill='#ffffff' height={24} width={24} />
    </div>
  );
}

export default Loading;
