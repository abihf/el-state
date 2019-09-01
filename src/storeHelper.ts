import { ContextType } from './provider';
import { StoreData, SubscriptionFn } from './types';

export const defaultMapState = (state: any) => state;

function deepEqual(a: any, b: any): boolean {
  if (typeof a !== typeof b) {
    return false;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  } else if (typeof a === 'object' && typeof b === 'object') {
    const keys = Object.keys(a);
    return (
      deepEqual(keys, Object.keys(b)) &&
      keys.every(key => deepEqual(a[key], b[key]))
    );
  }
  return a === b;
}

export function defaultStateComparator(prev: any, current: any): boolean {
  return !deepEqual(prev, current);
}

// export function defaultStateComparator(): boolean {
//   return true;
// }

export function subscribeToStateChange(ctx: ContextType, store: StoreData<any>, fn: SubscriptionFn) {
  let set = ctx.subscriptions.get(store);
  if (!set) {
    set = new Set();
    ctx.subscriptions.set(store, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
  };
}

export function getOrFillState<State>(ctx: ContextType, store: StoreData<State>): State {
  if (!ctx.states.has(store)) {
    const state = store.initialState;
    ctx.states.set(store, state);
    return state;
  }
  return ctx.states.get(store) as State;
}
