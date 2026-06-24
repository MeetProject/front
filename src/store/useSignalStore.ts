import { Client, StompSubscription } from '@stomp/stompjs';
import { create } from 'zustand';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeoutId: NodeJS.Timeout;
}

export type SignalStatus = 'closed' | 'connected' | 'reconnecting';

interface SignalState {
  client: null | Client;
  status: SignalStatus;
  subscription: Map<string, StompSubscription>;
  pendingRequest: Map<string, PendingRequest>;
  pendingPath: Map<string, string>;
}

export const useSignalStore = create<SignalState>(() => ({
  client: null,
  pendingPath: new Map(),
  pendingRequest: new Map(),
  status: 'closed',
  subscription: new Map(),
}));
