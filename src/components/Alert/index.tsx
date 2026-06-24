'use client';

import AlertItem from './AlertItem';

import { useAlertStore } from '@/store/useAlertStore';

export default function Alert() {
  const alerts = useAlertStore((state) => state.alerts);

  return (
    <div className='fixed bottom-28 left-6 z-2101 flex flex-col gap-2'>
      {alerts.map((alert) => (
        <AlertItem alert={alert} key={alert.id} />
      ))}
    </div>
  );
}
