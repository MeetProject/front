import ButtonTag from '../ButtonTag';

import * as Icon from '@/asset/svg';

export default function SensitiveInfoNotice() {
  return (
    <div className='-mt-0.5 flex items-center gap-2'>
      <p className='text-outline-dark text-xs'>민감한 정보는 포함하지 마세요.</p>
      <ButtonTag
        instant={true}
        name='민감한 정보는 보호되어야 하는 모든 데이터를 의미합니다. 예를 들어 비밀번호, 신용카드 번호, 세부적인 개인 정보를 포함하지 마세요.'
        style={{
          height: '64px',
          left: '-30px',
          padding: '8px',
          top: '100%',
          width: '294px',
        }}
      >
        <Icon.Help className='group fill-outline-dark' height={16} width={16} />
      </ButtonTag>
    </div>
  );
}
