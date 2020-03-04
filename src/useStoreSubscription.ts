import { useCallback, useEffect, useRef, useState } from 'react';
import { StoreManager } from './manager';
import { Store } from './store';

export type StateComparator<T> = (prev: T, current: T) => boolean;

type Option<Return> = {
  manager: StoreManager;
  stores: { current: Array<Store<unknown>> };
  getCurrentResult: () => Return;
  comparator: StateComparator<Return>;
};
export function useStoreSubscription<Return>({
  manager,
  stores,
  getCurrentResult,
  comparator,
}: Option<Return>): Return {
  // use ref to store current result and initialize the value.
  // the type can not be `Return` since it may be undefined
  // we need to make sure that current.value === undefined only
  // if it isn't initialized
  const value = useRef<{ result: Return }>();
  if (value.current === undefined) {
    value.current = { result: getCurrentResult() };
  }

  // tell react to rerender this component
  // should be called after updating `value.current`
  const [, forceRerender] = useState({});

  // compare value.current with value from store manager
  // if it changed, update the value and force rerender
  const updateResultAndForceRender = useCallback(() => {
    const result = getCurrentResult();
    const equal = comparator(value.current!.result, result);
    if (!equal) {
      value.current = { result };
      forceRerender({});
    }
    // comparator must be pure function, exclude that from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, getCurrentResult, forceRerender]);

  useEffect(() => {
    // maybe the state was changed while this component is being rendered
    updateResultAndForceRender();

    // subscribe to all stores change
    // and return function to unscribe them
    const unsubscribeFunctions = stores.current.map(store => manager.subscribe(store, updateResultAndForceRender));
    return () => unsubscribeFunctions.forEach(fn => fn());
    // list of store maybe recreated, but not its items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manager, updateResultAndForceRender, ...stores.current]);

  return value.current.result;
}
