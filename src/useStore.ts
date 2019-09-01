import { StateComparator, Store, ActionMap } from './types';
import { defaultMapState, defaultStateComparator, getOrFillState, subscribeToStateChange } from './storeHelper';
import { useStateContext } from './provider';
import { useState, useEffect } from 'react';

export type SingleStateMapper<State, Return> = (state: State) => Return;
export function useStore<State, Return = State>(
  store: Store<State, ActionMap<any>>,
  mapState = defaultMapState as SingleStateMapper<State, Return>,
  comparator = defaultStateComparator as StateComparator<Return>
): Return {
  const ctx = useStateContext();
  const [current, setCurrentValue] = useState(() => mapState(getOrFillState(ctx, store._storeData)));

  useEffect(() => {
    const subscription = () => {
      const newState = getOrFillState<State>(ctx, store._storeData);
      const newRes = mapState(newState);
      const shouldUpdate =
        mapState === defaultMapState && comparator === defaultStateComparator
          ? current !== newRes
          : comparator(current, newRes);
      if (shouldUpdate) {
        setCurrentValue(newRes);
      }
    };
    return subscribeToStateChange(ctx, store._storeData, subscription);
  }, [ctx, current]);

  return current;
}
