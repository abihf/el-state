import { useEffect, useState, useMemo, useCallback, useRef, useReducer } from 'react';
import { StoreManager, useStoreManager } from './provider';
import { Store } from './store';
import { arrayComparator, strictComparator } from './comparator';

export type StateComparator<T> = (prev: T, current: T) => boolean;

type Stores<States extends any[]> = { [i in keyof States]: Store<States[i]> };

export function combineStore<States extends any[]>(...stores: Stores<States>): Stores<States> {
  return stores;
}

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

export function useStore<States extends any[]>(stores: Stores<States>): States;

export function useStore<States extends any[], Return = States>(
  stores: Stores<States>,
  mapState: (state: States) => Return,
  comparator?: StateComparator<Return>
): Return;

export function useStore<Return, States extends any[]>(
  inputStore: Store<unknown> | Stores<States>,
  mapState = identityFn as (states: unknown) => Return,
  comparator = defaultComparator(Array.isArray(inputStore)) as StateComparator<Return>,
  deps: any[] = []
): Return {
  // get store manager from context
  const manager = useStoreManager();

  // normalize parameters, all the logic bellow assume user input multiple stores
  const stores = useMemo(() => (Array.isArray(inputStore) ? inputStore : [inputStore]), [inputStore]);
  const normalizedMapState = useCallback(
    (states: unknown[]) => (Array.isArray(inputStore) ? mapState(states) : mapState(states[0])),
    [inputStore, ...deps] // don't add mapState
  );

  // fetch state from store manager, and transform the result.
  const getCurrentResult = useCallback(() => {
    // easy debugging
    const states = getOrFillStateArray(manager, stores);
    const result = normalizedMapState(states);
    return result;
  }, [manager, stores, normalizedMapState]);

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
    const equal = comparator(value.current?.result!, result);
    if (!equal) {
      value.current = { result };
      forceRerender({});
    }
  }, [value, getCurrentResult, forceRerender]);

  useEffect(() => {
    // maybe the state was changed while this component is being rendered
    updateResultAndForceRender();

    // subscribe to all stores change
    // and return function to unscribe them
    const unsubscribeFunctions = stores.map(store => manager.subscribe(store, updateResultAndForceRender));
    return () => unsubscribeFunctions.forEach(fn => fn());
  }, [manager, stores, updateResultAndForceRender]);

  return value.current.result;
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
