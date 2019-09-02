import * as React from 'react';
import { StoreData, SubscriptionSet, Store, StoreMap, StoresState } from './types';

export type GlobalStates = WeakMap<StoreData<any>, unknown>
export type ContextType = {
  states: GlobalStates;
  subscriptions: WeakMap<StoreData<any>, SubscriptionSet>;
};
const Context = React.createContext<ContextType | undefined>(undefined);


type ProviderProps = {
  states?: GlobalStates;
};

export const StoreProvider: React.FC<ProviderProps> = ({ states, ...props }) => {
  const value: ContextType = {
    states: states || createGlobalStates(),
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

export function createGlobalStates(initialStates: Array<{store: Store<any, any>, state: unknown}> = []): GlobalStates {
  return new WeakMap<StoreData<any>, unknown>(initialStates.map(({store, state}) => ([store._storeData, state])));
}

export function extractGlobalStates<Stores extends StoreMap>(ps: GlobalStates, stores: Stores): Partial<StoresState<Stores>> {
  return Object.keys(stores).reduce((result, key: keyof Stores) => {
    const mapKey = stores[key]._storeData;
    if (ps.has(mapKey)) {
      result[key] = ps.get(mapKey) as StoresState<Stores>[typeof key];
    }
    return result;
  }, {} as Partial<StoresState<Stores>>);
}