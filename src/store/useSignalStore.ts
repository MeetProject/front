import { Client, StompSubscription } from '@stomp/stompjs';
import { create } from 'zustand';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeoutId: NodeJS.Timeout;
}

interface SignalState {
  client: null | Client;
  subscription: Map<string, StompSubscription>;
  pendingRequest: Map<string, PendingRequest>;
  isDisconnected: boolean;
}

export const useSignalStore = create<SignalState>(() => ({
  client: null,
  isDisconnected: false,
  pendingRequest: new Map(),
  subscription: new Map(),
}));
