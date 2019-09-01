import { useMemo } from 'react';
import { ContextType, useStateContext } from './provider';
import { getOrFillState } from './storeHelper';
import { Dispatcher, StateUpdater, StateUpdaterFunction, StoreData, SubscriptionSet, DispatchFunction } from './types';

function isStateUpdaterFunction<State>(updater: StateUpdater<State>): updater is StateUpdaterFunction<State> {
  return typeof updater === 'function';
}

function isPromise<T = any>(p: T | Promise<T>): p is Promise<T> {
  return 'then' in p && typeof p.then === 'function';
}

type DispatcherOption = {
  changesSet: Set<StoreData<any>>;
  changesMap: WeakMap<StoreData<any>, unknown>;
  commit(): void;
};

function createDispatcher(context: ContextType, opt?: DispatcherOption): Dispatcher {
  return dispatchFn => {
    let autoCommit = !opt;
    const changesSet = opt ? opt.changesSet : new Set<StoreData<any>>();
    let changesMap = opt ? opt.changesMap : new WeakMap();

    const commit = opt
      ? opt.commit
      : () => {
          const allSubscription: SubscriptionSet = new Set();
          changesSet.forEach(id => {
            context.states.set(id, changesMap.get(id));
            const subscriptions = context.subscriptions.get(id);
            if (subscriptions) {
              subscriptions.forEach(fn => allSubscription.add(fn));
            }
          });
          allSubscription.forEach(fn => {
            try {
              fn();
            } catch (e) {
              console.error('Error when calling subscription', e);
            }
          });
          changesSet.clear();
          changesMap = new WeakMap();
        };

    const getState = () => changesMap.get(dispatchFn.store) || getOrFillState<any>(context, dispatchFn.store);
    const result = dispatchFn({
      state: getState(),
      getState,
      setState: (updater, forceCommit: boolean = false) => {
        const state = isStateUpdaterFunction(updater) ? updater(getState()) : updater;
        changesSet.add(dispatchFn.store);
        changesMap.set(dispatchFn.store, state);
        if (forceCommit) {
          commit();
        }
      },

      commit,
      disableAutoCommit() {
        autoCommit = false;
      },

      getStore: otherStore => (changesMap.get(otherStore._storeData) as any) || getOrFillState(context, otherStore._storeData),
      dispatch: createDispatcher(context, { changesMap, commit, changesSet }),
    });
    if (autoCommit) {
      if (result && isPromise(result)) {
        result.then(() => commit());
      } else {
        commit();
      }
    }
    return result;
  };
}

export function useDispatcher(): Dispatcher {
  const ctx = useStateContext();
  return useMemo(() => createDispatcher(ctx), [ctx]);
}

export function useAction<State, Return>(action: DispatchFunction<State, Return>): () => Return;

export function useAction<State, Args extends any[], Return>(
  action: (...args: Args) => DispatchFunction<State, Return>
): (...args: Args) => Return;

export function useAction<State, Args extends any[], Return>(
  action: ((...args: Args) => DispatchFunction<State, Return>) | DispatchFunction<State, Return>
) {
  const dispatch = useDispatcher();
  return useMemo(() => {
    if ('store' in action) {
      return () => dispatch(action);
    } else {
      return (...args: Args) => dispatch(action(...args));
    }
  }, [dispatch]);
}
