import * as React from 'react';
import { StoreData, SubscriptionSet } from './types';

export type ContextType = {
  states: WeakMap<StoreData<any>, unknown>;
  subscriptions: WeakMap<StoreData<any>, SubscriptionSet>;
};
const Context = React.createContext<ContextType | undefined>(undefined);

type ProviderProps = {
  initialStates?: WeakMap<StoreData<any>, unknown>;
};

export const StoreProvider: React.FC<ProviderProps> = ({ initialStates, ...props }) => {
  const value: ContextType = {
    states: initialStates || new WeakMap(),
    subscriptions: new WeakMap(),
  };
  return <Context.Provider {...props} value={value} />;
};

export function useStateContext() {
  const ctx = React.useContext(Context);
  if (!ctx) {
    throw new Error('Not inside provider');
  }
  return ctx;
}

