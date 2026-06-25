import { create } from 'zustand';

import { AlertType } from '@/types/components';

interface AlertState {
  alerts: AlertType[];
  addAlert: (message: string, duration?: number, onClose?: () => void) => void;
  removeAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  addAlert: (message, duration = 4000, onClose) => {
    const id = crypto.randomUUID();
    set((state) => ({ alerts: [...state.alerts, { duration, id, message, onClose }] }));
  },
  alerts: [],
  removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
}));
