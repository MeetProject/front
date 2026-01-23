import * as Icon from '@/asset/svg';
import { DeviceSelectBox } from '@/components';
import { DeviceKindType } from '@/types/deviceType';

interface DeviceBoxesProps {
  type: DeviceKindType;
  onDisabledClick: () => void;
}

export default function DeviceBoxes({ onDisabledClick, type }: DeviceBoxesProps) {
  if (type === 'audio') {
    return (
      <>
        <div className='h-7.5 w-62'>
          <DeviceSelectBox
            className='rounded-3xl'
            selectorPositionY='top'
            theme='dark'
            type='audioInput'
            volume={true}
            onDisabledClick={onDisabledClick}
          />
        </div>
        <div className='h-7.5 w-62'>
          <DeviceSelectBox
            className='rounded-3xl'
            selectorPositionY='top'
            theme='dark'
            type='audioOutput'
            volume={true}
            onDisabledClick={onDisabledClick}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className='h-7.5 flex-1'>
        <DeviceSelectBox
          className='rounded-3xl'
          selectorPositionY='top'
          theme='dark'
          type='videoInput'
          onDisabledClick={onDisabledClick}
        />
      </div>
      <div className='itmes-center flex gap-2 max-[775px]:hidden'>
        <button className='border-device-outline flex h-7.5 items-center justify-center gap-1 rounded-3xl border px-3'>
          <Icon.Blur fill='#c4c7c5' height={20} width={20} />
          <p className='text-device-content text-sm'>백그라운드 흐리게 처리</p>
        </button>
        <button className='h-7.5 rounded-3xl border border-[rgb(68,71,70)] px-3'>
          <p className='text-device-content text-sm'>배경 및 효과</p>
        </button>
      </div>
    </>
  );
}
