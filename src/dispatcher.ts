import { Action, ActionPromise } from './action';
import { StoreManager } from './manager';
import { Store } from './store';

export interface Dispatcher {
  /**
   * Invoke synchronous action
   *
   * @param action action that will be invoked
   * @param args action arguments
   */
  <State, Args extends any[]>(action: Action<State, Args>, ...args: Args): void;

  /**
   * Invoke asynchronous action
   *
   * @param action action that will be invoked
   * @param args action arguments
   */
  <State, Args extends any[]>(action: ActionPromise<State, Args>, ...args: Args): Promise<void>;
}

export type DispatchContext<State> = {
  /**
   * State when the action is called. For complex action, please use {@link ActionContext.getState | getState}
   */
  state: DeepReadonly<State>;

  /**
   *
   * @param updater the new state, or function that produce new state
   * @param forceCommit if true, commit all changes after setting this state
   */
  setState(updater: StateUpdater<State>, forceCommit?: boolean): void;

  /**
   * by default, action that called from {@link useAction} and {@link useDispatcher}
   * will be automatically commited after the action done
   */
  disableAutoCommit(): void;

  /**
   * manually flush all pending changes to global stores, and trigger rerender
   * of changed components
   */
  commit(): void;

  /**
   * get current state of the other store
   *
   * @param store other store
   */
  getStore<OtherState>(store: Store<OtherState>): OtherState;

  /**
   * dispatch other action
   */
  dispatch: Dispatcher;

  /**
   * Shallow merge current state with `partialState`.
   * Only valid for object based State
   *
   * @param partialState object that will be merged to current state
   * @param forceCommit if true, commit all changes after merging
   */
  mergeState(partialState: IfObject<State, Partial<State>>, forceCommit?: boolean): void;
};

// if `O` is object than `Type`, else `never`
type IfObject<O, Type> = O extends any[] ? never : O extends object ? Type : never;

type StateUpdater<State> = State | StateUpdaterFunction<State>;
type StateUpdaterFunction<State> = (prev: DeepReadonly<State>) => State;

type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export function createDispatcher(manager: StoreManager): Dispatcher {
  return <State, Args extends any[]>(action: Action<State, Args>, ...args: Args) => {
    const changesMap = new WeakMap<Store<unknown>, Array<StateUpdaterFunction<unknown>>>();
    const changeSet = new Set<Store<unknown>>();

    const commit = () => {
      if (changeSet.size === 0) return;

      const newStates = new Map<string, unknown>();
      changeSet.forEach(store => {
        const changes = changesMap.get(store)!;
        const newState = changes.reduce((prev, updater) => updater(prev), manager.getState(store));
        newStates.set(store.name, newState);
        changesMap.delete(store);
      });
      changeSet.clear();

      manager.commit(newStates);
    };

    // create child dispatcher once
    const childDispatcher = (childAction: Action<any, any[]>, ...childArgs: any[]) =>
      dispatch(childAction, childArgs, false);

    let rootDone = false;

    function dispatch<State, Args extends any[]>(
      childAction: Action<State, Args> | ActionPromise<State, Args>,
      childArgs: Args,
      isRoot: boolean
    ): any {
      // let autoCommit = isRoot;
      let noAutoCommit = false;

      const setState = (updater: StateUpdater<State>, forceCommit: boolean = false) => {
        const fn = isStateUpdaterFunction<unknown>(updater) ? updater : () => updater;
        const store = childAction.store;
        changeSet.add(store);
        if (changesMap.has(store)) {
          changesMap.get(store)!.push(fn);
        } else {
          changesMap.set(store, [fn]);
        }

        if (forceCommit) {
          commit();
        }
      };

      const state = manager.getState(childAction.store) as DeepReadonly<State>;

      const ctx: DispatchContext<State> = {
        state,
        setState,
        mergeState(partialState, forceCommit) {
          if (typeof state !== 'object' || Array.isArray(state)) {
            throw new Error('Merge state only available for object based state');
          }
          setState(oldState => Object.assign(Object.create(null), oldState, partialState), forceCommit);
        },

        commit,
        disableAutoCommit() {
          noAutoCommit = true;
        },

        getStore: manager.getState,
        dispatch: childDispatcher,
      };

      const result = childAction.fn(ctx as DispatchContext<State>, ...childArgs);

      const handleResult = (newState: State | void) => {
        if (newState !== undefined) {
          setState(newState);
        }
        const autoCommit = !noAutoCommit && (isRoot || rootDone);
        if (autoCommit) {
          commit();
        }
        if (process.env.NODE_ENV !== 'production' && manager.devTool) {
          let type = `${childAction.store.name}.${childAction.name || '<unknown>'}`;
          if (!isRoot) {
            type += ' (child)';
          } else if (!autoCommit) {
            type += ' (deferred)';
          }
          manager.devTool.log({ type, args: childArgs });
        }
        if (isRoot) {
          rootDone = true;
        }
      };

      if (isPromise(result)) {
        return result.then(handleResult);
      } else {
        return handleResult(result);
      }
    }

    return dispatch(action, args, true);
  };
}

function isPromise<T>(p: T | Promise<T>): p is Promise<T> {
  return typeof p === 'object' && 'then' in p && typeof p.then === 'function';
}

function isStateUpdaterFunction<State>(updater: StateUpdater<State>): updater is StateUpdaterFunction<State> {
  return typeof updater === 'function';
}
