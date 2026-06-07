import Image, { StaticImageData } from 'next/image';
import { useState } from 'react';

interface EmojiButtonProperties {
  src: StaticImageData;
  hoverSrc: StaticImageData;
  name: string;
  onClick: () => void;
}
export default function EmojiButton({ hoverSrc, name, onClick, src }: EmojiButtonProperties) {
  const [isHover, setIsHover] = useState<boolean>(false);

  const handleButtonClick = () => {
    onClick();
  };

  const handleMouseEnter = () => {
    setIsHover(true);
  };

  const handleMouseLeave = () => {
    setIsHover(false);
  };
  return (
    <button
      className='bg-state-dim hover:bg-state-dim-hover active:bg-state-pressed flex size-10 items-center justify-center rounded-full'
      type='button'
      onClick={handleButtonClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image alt={name} height={24} src={isHover ? hoverSrc : src} unoptimized={isHover} width={24} />
      <div aria-hidden='true' className='absolute hidden'>
        <Image alt='프리로딩' height={24} priority={true} src={hoverSrc} unoptimized={true} width={24} />
      </div>
    </button>
  );
}
