import deepEqual from 'fast-deep-equal';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';
import { useStoreManager } from './provider';
import { StateComparator, Store } from './store';

type Stores<States extends any[]> = {
  [index in keyof States]: Store<States[index]>;
};

/**
 * Create multi-store selector
 *
 * @param stores list of store that will be used
 * @returns a function to create react hook
 */
export function createSelector<States extends any[]>(...stores: Stores<States>) {
  /**
   * Create react hook to use one or more store's state.
   *
   * @param select Function that fetch stores and return the result
   * @param comparator Compare old & new value returned by `select()`.
   * @returns React hook that evaluate select() when there is state change event;
   */
  return <Args extends any[], Return>(
    select: (states: States, ...args: Args) => Return,
    comparator: StateComparator<Return> = deepEqual
  ) => {
    return function useSelector(...args: Args) {
      const manager = useStoreManager();
      return useSyncExternalStoreWithSelector(
        (notify) => {
          const unsubscribeFunctions = stores.map((store) => manager.subscribe(store, notify));
          return () => unsubscribeFunctions.forEach((fn) => fn());
        },
        () => stores.map((store) => manager.getState(store)) as States,
        undefined,
        (states) => select(states, ...args),
        comparator
      );
    };
  };
}
