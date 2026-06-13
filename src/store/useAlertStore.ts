import { create } from 'zustand';

import { Alert } from '@/types/components';

interface AlertState {
  alerts: Alert[];
  addAlert: (message: string, duration?: number, onClose?: () => void) => void;
  removeAlert: (id: number) => void;
}

const alertId = { current: 0 };
const alertTimers = new Map<number, { onClose?: () => void; timeoutId: NodeJS.Timeout }>();

const closeAlert = (id: number, set: (fn: (state: AlertState) => Partial<AlertState>) => void) => {
  const timer = alertTimers.get(id);
  if (!timer) {
    return;
  }

  clearTimeout(timer.timeoutId);
  alertTimers.delete(id);

  set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
  timer.onClose?.();
};

export const useAlertStore = create<AlertState>((set) => ({
  addAlert: (message, duration = 4000, onClose) => {
    const id = (alertId.current += 1);
    set((state) => ({ alerts: [...state.alerts, { id, message }] }));

    const timeoutId = setTimeout(() => closeAlert(id, set), duration);
    alertTimers.set(id, { onClose, timeoutId });
  },
  alerts: [],
  removeAlert: (id) => closeAlert(id, set),
}));
