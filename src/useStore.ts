import { useEffect, useState } from 'react';
import { StoreManager, useStoreManager } from './provider';
import { Store } from './store';
import { arrayComparator, strictComparator } from './comparator';

export type StateComparator<T> = (prev: T, current: T) => boolean;

type Stores<States extends any[]> = { [i in keyof States]: Store<States[i]> };

export function combineStore<States extends any[]>(...stores: Stores<States>): Stores<States> {
  return stores;
}

export function useStore<State, Return = State>(
  store: Store<State>,
  mapState?: (state: State) => Return,
  comparator?: StateComparator<Return>
): Return;

export function useStore<States extends any[]>(stores: Stores<States>): States;

export function useStore<States extends any[], Return = States>(
  stores: Stores<States>,
  mapState: (state: States) => Return,
  comparator?: StateComparator<Return>
): Return;

export function useStore<Return, States extends any[]>(
  inputStore: Store<unknown> | Stores<States>,
  mapState = identityFn as (states: unknown) => Return,
  comparator = defaultComparator(Array.isArray(inputStore)) as StateComparator<Return>
): Return {
  const stores = Array.isArray(inputStore) ? inputStore : [inputStore];
  const normalizedMapState = (states: unknown[]) =>
    Array.isArray(inputStore) ? mapState(states) : mapState(states[0]);

  const manager = useStoreManager();
  const [current, setCurrentValue] = useState(() => normalizedMapState(getOrFillStateArray(manager, stores)));

  useEffect(() => {
    const subscriptionFn = () => {
      const newStates = getOrFillStateArray(manager, stores);
      const newRes = normalizedMapState(newStates);
      const equal = comparator(current, newRes);
      if (!equal) {
        setCurrentValue(newRes);
      }
    };
    const unsubscribeFunctions = stores.map(store => manager.subscribe(store, subscriptionFn));
    return () => unsubscribeFunctions.forEach(fn => fn());
  }, [manager, current]);

  return current;
}

function identityFn<T = unknown>(states: T): T {
  return states;
}

function defaultComparator(isArray: boolean) {
  return isArray ? arrayComparator : strictComparator;
}

function getOrFillStateArray<States extends any[]>(manager: StoreManager, stores: Stores<States>) {
  return stores.map(store => manager.getState(store)) as States;
}
