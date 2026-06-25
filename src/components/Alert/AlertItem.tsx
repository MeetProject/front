'use client';

import { useEffect } from 'react';

import { useAlertStore } from '@/store/useAlertStore';
import { AlertType } from '@/types/components';

export default function AlertItem({ alert }: { alert: AlertType }) {
  const removeAlert = useAlertStore((state) => state.removeAlert);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeAlert(alert.id);
      alert.onClose?.();
    }, alert.duration);

    return () => clearTimeout(timer);
  }, [alert, removeAlert]);

  return (
    <div
      className='bg-surface-elevated text-on-surface-bright w-78 rounded px-4 py-3.5'
      style={{
        boxShadow:
          'rgba(0, 0, 0, 0.2) 0px 3px 5px -1px, rgba(0, 0, 0, 0.14) 0px 6px 10px 0px, rgba(0, 0, 0, 0.12) 0px 1px 18px 0px',
      }}
    >
      {alert.message}
    </div>
  );
}
