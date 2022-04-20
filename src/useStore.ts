import deepEqual from 'fast-deep-equal';
import { useStoreManager } from './provider';
import { Store, StateComparator } from './store';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';

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
 * @param comparator Compare old & new value returned by mapState
 *
 * @returns transformed state
 */
export function useStore<State, Return = State>(
  store: Store<State>,
  mapState: (state: State) => Return,
  comparator?: StateComparator<Return>
): Return;

export function useStore<Return>(
  store: Store<unknown>,
  mapState?: (state: unknown) => Return,
  comparator?: StateComparator<Return>
): Return {
  // get store manager from context
  const manager = useStoreManager();

  // subscribe to store changes
  return useSyncExternalStoreWithSelector(
    (notify) => manager.subscribe(store, notify),
    () => manager.getState(store),
    undefined,
    (mapState || identityFn) as (state: unknown) => Return,
    comparator ?? mapState ? deepEqual : strictEqual
  );
}

function identityFn<T = unknown>(states: T): T {
  return states;
}

function strictEqual<T>(a: T, b: T) {
  return a === b;
}
