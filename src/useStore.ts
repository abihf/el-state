import { useCallback, useRef } from 'react';
import { useStoreManager } from './provider';
import { Store } from './store';
import { StateComparator, useStoreSubscription } from './useStoreSubscription';

/**
 * Get state of single store.
 *
 * @param store Store whose state will be used
 *
 * @returns current store's state
 */
export function useStore<State>(store: Store<State>): State;

/**
 * Get state of single store and transform it using mapState.
 * Argument `comparator` is used to compare old & new value,
 * if it return false, the component will be rerendered.
 *
 * @param store Store whose state will be used
 * @param mapState Transform state into different value
 * @param comparator Compare old & new value returned by mapState.
 * @param deps Dependencies of mapState
 *
 * @returns transformed state
 */
export function useStore<State, Return = State>(
  store: Store<State>,
  mapState?: (state: State) => Return,
  comparator?: StateComparator<Return>,
  deps?: any[]
): Return;

export function useStore<Return>(
  store: Store<unknown>,
  mapState = identityFn as (states: unknown) => Return,
  comparator = strictComparator as StateComparator<Return>,
  deps: any[] = []
): Return {
  // get store manager from context
  const manager = useStoreManager();
  const stores = useRef([store]);

  // fetch state from store manager, and transform the result.
  const getCurrentResult = useCallback(() => {
    // easy debugging
    const states = manager.getState(store);
    const result = mapState(states);
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manager, store, ...deps]); // array stores maybe recreated but not its values

  // subscribe to store changes
  return useStoreSubscription({ manager, stores, getCurrentResult, comparator });
}

function identityFn<T = unknown>(states: T): T {
  return states;
}

function strictComparator<T>(a: T, b: T) {
  return a === b;
}
