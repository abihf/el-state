import { unstable_batchedUpdates } from 'react-dom';
import { DevTool, initDevTool } from './devTool';
import { createDispatcher, Dispatcher } from './dispatcher';
import { Store } from './store';

export type GlobalStates = Map<string, unknown>;

export type SubscriptionCallback = () => void;
export type SubscriptionSet = Set<SubscriptionCallback>;

export interface StoreManager {
  /**
   * Get current state of a store
   * @param store input store
   */
  getState<State>(store: Store<State>): State;

  /** @internal */
  commit(states: Map<string, unknown>): void;

  /** @internal */
  subscribe(store: Store<unknown>, cb: SubscriptionCallback): () => void;

  /** @internal */
  dispatcher: Dispatcher;

  /** @internal */
  devTool?: DevTool;
}

export function createStoreManager(initialStates?: GlobalStates, enableDevTool?: boolean) {
  const states = initialStates || new Map<string, unknown>();
  const subscriptions = new Map<string, SubscriptionSet>();
  const manager: StoreManager = {
    subscribe(store, fn) {
      const name = store.name;
      if (!subscriptions.has(name)) {
        subscriptions.set(name, new Set());
      }
      const set = subscriptions.get(name)!;
      set.add(fn);
      return () => set.delete(fn);
    },
    getState<State>(store: Store<State>) {
      const name = store.name;
      if (states.has(name)) {
        return states.get(name) as State;
      } else {
        const state = store.initState();
        states.set(name, state);
        return state;
      }
    },
    commit(newStates) {
      const triggered: SubscriptionSet = new Set();
      newStates.forEach((state, name) => {
        states.set(name, state);
        const callbacks = subscriptions.get(name);
        if (callbacks) {
          callbacks.forEach((cb) => triggered.add(cb));
        }
      });
      if (triggered.size > 0) {
        unstable_batchedUpdates((callbacks) => callbacks.forEach((cb) => cb()), triggered);
      }
    },
    dispatcher: undefined!, // will be set below
  };
  manager.dispatcher = createDispatcher(manager);

  if (enableDevTool) {
    manager.devTool = initDevTool(states, subscriptions);
  }
  return manager;
}
