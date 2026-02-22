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
}

export const useSignalStore = create<SignalState>(() => ({
  client: null,
  pendingRequest: new Map(),
  subscription: new Map(),
}));
