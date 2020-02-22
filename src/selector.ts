import * as defaultComparator from 'fast-deep-equal';
import { useCallback, useRef } from 'react';
import { useStoreManager } from './provider';
import { Store } from './store';
import { StateComparator, useStoreSubscription } from './useStoreSubscription';

interface StoreGetter {
  /**
   * @param store Store whose state will be retrieved.
   * @returns Current state of the store
   */
  <State>(store: Store<State>): State;
}

type SelectFunction<Args extends any[], Return> = (getStore: StoreGetter, ...args: Args) => Return;

/**
 * Create react hook to use one or more store's state.
 *
 * @param select Function that fetch stores and return the result
 * @param comparator Compare old & new value returned by `select()`.
 * @returns React hook that call select() and subscribe to state change event;
 */
export function createSelector<Args extends any[], Return>(
  select: SelectFunction<Args, Return>,
  comparator = defaultComparator as StateComparator<Return>
) {
  return function useSelector(...args: Args): Return {
    const manager = useStoreManager();
    const stores = useRef<Store<unknown>[]>([]);

    const getCurrentResult = useCallback(() => {
      // easy debugging
      const selectedStores: Array<Store<unknown>> = [];
      const result = select(store => {
        selectedStores.push(store);
        return manager.getState(store);
      }, ...args);
      stores.current = selectedStores;
      return result;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [manager, ...args]); // array stores maybe recreated but not its values

    // subscribe to store changes
    return useStoreSubscription({ manager, stores, getCurrentResult, comparator });
  };
}
