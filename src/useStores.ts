import { Store, StateComparator, ActionMap } from './types';
import { defaultMapState, defaultStateComparator, subscribeToStateChange, getOrFillState } from './storeHelper';
import { useStateContext, ContextType } from './provider';
import { useState, useEffect } from 'react';

type StoreMap = Record<string, Store<any, ActionMap<any>>>;
type StoresState<Stores extends StoreMap> = {
  [i in keyof Stores]: Stores[i] extends Store<infer State, ActionMap<any>> ? State : never;
};
export type MultiStateMapper<Stores extends StoreMap, Return> = (states: StoresState<Stores>) => Return;
export function useStores<Stores extends StoreMap, Return>(
  stores: Stores,
  mapState = defaultMapState as MultiStateMapper<Stores, Return>,
  comparator = defaultStateComparator as StateComparator<Return>
): Return {
  const ctx = useStateContext();
  const [current, setCurrentValue] = useState(() => mapState(getOrFileStateObject(ctx, stores)));

  useEffect(() => {
    const subscriptionFn = () => {
      const newStates = getOrFileStateObject(ctx, stores);
      const newRes = mapState(newStates);
      const shouldUpdate = comparator(current, newRes);
      if (shouldUpdate) {
        setCurrentValue(newRes);
      }
    };
    const unsubscribeFunctions = Object.values(stores).map(store => subscribeToStateChange(ctx, store._storeData, subscriptionFn));
    return () => {
      unsubscribeFunctions.map(fn => fn());
    };
  }, [ctx, current]);

  return current;
}
function getOrFileStateObject<Stores extends StoreMap>(ctx: ContextType, stores: Stores) {
  return Object.keys(stores).reduce(
    (result, key: keyof Stores) => {
      result[key] = getOrFillState(ctx, stores[key]._storeData);
      return result;
    },
    {} as StoresState<Stores>
  );
}
