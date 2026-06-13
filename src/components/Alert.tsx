'use client';

import * as Icon from '@/asset/svg';
import { useAlertStore } from '@/store/useAlertStore';

export default function Alert() {
  const alerts = useAlertStore((state) => state.alerts);

  return (
    <div className='fixed bottom-28 left-6 z-2101 flex flex-col gap-2'>
      {alerts.map((alert) => (
        <div
          className='bg-surface-elevated text-on-surface-bright flex w-78 items-center justify-between gap-2 rounded px-4 py-3.5'
          key={alert.id}
          style={{
            boxShadow:
              'rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px',
          }}
        >
          <span>{alert.message}</span>
          <button
            aria-label='알림 닫기'
            className='flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)]'
            type='button'
            onClick={() => useAlertStore.getState().removeAlert(alert.id)}
          >
            <Icon.Delete className='fill-on-surface-bright' height={12} width={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
