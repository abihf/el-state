import { Action, getFullActionName } from './action';
import { StoreManager } from './manager';
import { Store } from './store';

export interface Dispatcher {
  /**
   * Invoke action
   *
   * @param action action that will be invoked
   * @param args action arguments
   */
  <State, Args extends any[]>(action: Action<State, Args>, ...args: Args): void;
}

export interface DispatchContext<State> {
  /**
   * State when the action is called. For complex action, please use {@link DispatchContext.getState | getState()}
   */
  state: DeepReadonly<State>;

  /**
   * Get current state of associated store
   */
  getState(): DeepReadonly<State>;

  /**
   *
   * @param updater the new state, or function that produce new state
   * @param forceCommit if true, commit all changes after setting this state
   */
  setState(updater: StateUpdater<State>, forceCommit?: boolean): void;

  /**
   * Shallow merge current state with `partialState`.
   * Only valid for object based State
   *
   * @param partialState object that will be merged to current state
   * @param forceCommit if true, commit all changes after merging
   */
  mergeState(partialState: IfObject<State, Partial<State>>, forceCommit?: boolean): void;

  /**
   * get current state of the other store
   *
   * @param store other store
   */
  getStore<OtherState>(store: Store<OtherState>): DeepReadonly<OtherState>;

  /**
   * dispatch other action
   */
  dispatch: Dispatcher;

  /**
   * This is helpful to batch react update when you call multiple setState on async context
   *
   * @param fn Function that call multiple {@link DispatchContext.setState | setState()} multiple times.
   */
  bulkUpdate(fn: () => void): void;
}

// if `O` is object return `Then`. if not return `Else`
type IfObject<O, Then, Else = never> = O extends any[] ? Else : O extends object ? Then : Else;

type StateUpdater<State> = State | DeepReadonly<State> | StateUpdaterFunction<State>;
type StateUpdaterFunction<State> = (prev: DeepReadonly<State>) => State | DeepReadonly<State>;

type Builtin = string | number | boolean | bigint | symbol | undefined | null | Function | Date | Error | RegExp;
export type DeepReadonly<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends ReadonlySet<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepReadonly<U>>
  : T extends Promise<infer U>
  ? Promise<DeepReadonly<U>>
  : T extends {}
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : Readonly<T>;

export function createDispatcher(manager: StoreManager): Dispatcher {
  let currentChangesMap: Map<string, unknown> | undefined;
  let isInsideBulkUpdate = false;

  function prepareBulkUpdate() {
    const isRoot = !isInsideBulkUpdate;

    const changesMap = isRoot ? new Map<string, unknown>() : currentChangesMap!;
    if (isRoot) {
      isInsideBulkUpdate = true;
      currentChangesMap = changesMap;
    }

    function commit() {
      if (changesMap.size > 0) {
        manager.commit(changesMap);
        changesMap.clear();
      }
    }

    function done() {
      if (isRoot) {
        isInsideBulkUpdate = false;
        currentChangesMap = undefined;
      }
    }

    return { isRoot, changesMap, commit, done };
  }

  function bulkUpdate(fn: () => void) {
    const { isRoot, commit, done } = prepareBulkUpdate();
    fn();

    if (isRoot) {
      commit();
      if (process.env.NODE_ENV !== 'production' && manager.devTool) {
        manager.devTool.log({ type: '@bulkUpdate' });
      }
    }

    done();
  }

  function getStore<State>(store: Store<State>): DeepReadonly<State> {
    return ((isInsideBulkUpdate && currentChangesMap && currentChangesMap.get(store.name)) ||
      manager.getState(store)) as DeepReadonly<State>;
  }

  function dispatch<State, Args extends any[]>(action: Action<State, Args>, ...args: Args) {
    const { isRoot, commit, done } = prepareBulkUpdate();

    let isInDispatch = true;
    const storeName = action.store.name;

    const getState = () => getStore(action.store);
    const setState = (updater: StateUpdater<State>, forceCommit: boolean = false) => {
      if (process.env.NODE_ENV !== 'production' && !isInsideBulkUpdate && !isStateUpdaterFunction(updater)) {
        console.warn(
          new Error(
            'You call setState() with plain state outside action, it can make state inconsistent. ' +
              'This error might happen when you use async action. Consider using setState() with callback function.'
          )
        );
      }

      const bulk = prepareBulkUpdate();
      const state = isStateUpdaterFunction(updater) ? updater(getStore(action.store)) : updater;

      bulk.changesMap.set(storeName, state);
      if (forceCommit || bulk.isRoot) {
        bulk.commit();
      }

      if (process.env.NODE_ENV !== 'production' && manager.devTool && !isInDispatch) {
        const type = `${getFullActionName(action)} (setState)`;
        manager.devTool.log({ type, args });
      }

      bulk.done();
    };

    const state = getState();
    const ctx: DispatchContext<State> = {
      state,
      getState,
      setState,
      mergeState(partialState, forceCommit) {
        if (typeof state !== 'object' || Array.isArray(state)) {
          throw new Error('Merge state only available for object based state');
        }
        setState(oldState => Object.assign(Object.create(null), oldState, partialState), forceCommit);
      },

      getStore,
      dispatch,
      bulkUpdate,
    };

    const newState = action.fn(ctx, ...args);

    if (!isPromise(newState) && newState !== undefined) {
      setState(newState);
    }
    if (isRoot) commit();

    if (process.env.NODE_ENV !== 'production' && manager.devTool) {
      let type = getFullActionName(action);
      if (!isRoot) {
        type += ' (child)';
      }
      manager.devTool.log({ type, args });
    }

    isInDispatch = false;
    done();
  }

  return dispatch;
}

function isPromise<T>(p: T | Promise<T>): p is Promise<T> {
  return typeof p === 'object' && 'then' in p && typeof p.then === 'function';
}
function isStateUpdaterFunction<State>(updater: StateUpdater<State>): updater is StateUpdaterFunction<State> {
  return typeof updater === 'function';
}
