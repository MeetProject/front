'use client';

import { useAlertStore } from '@/store/useAlertStore';

export default function Alert() {
  const alerts = useAlertStore((state) => state.alerts);

  return (
    <div className='fixed bottom-28 left-6 z-2101 flex flex-col gap-2'>
      {alerts.map((alert) => (
        <div
          className='w-78 rounded bg-[#3C4043] px-4 py-3.5 text-[#E8EAED]'
          key={alert.id}
          style={{
            boxShadow:
              'rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px',
          }}
        >
          {alert.message}
        </div>
      ))}
    </div>
  );
}
