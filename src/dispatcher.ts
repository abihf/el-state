import { Action, ActionPromise } from './action';
import { StoreManager } from './manager';
import { Store } from './store';

export interface Dispatcher {
  <State, Args extends any[]>(action: Action<State, Args>, ...args: Args): void;
  <State, Args extends any[]>(action: ActionPromise<State, Args>, ...args: Args): Promise<void>;
}

type DispatchContextBase<State> = {
  /**
   * State when the action is called. For complex action, please use {@link ActionContext.getState | getState}
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
};

type MergeableDispatchContext<State> = DispatchContextBase<State> & {
  /**
   * Shallow merge current state with `partialState`.
   * Only valid for object based State
   *
   * @param partialState object that will be merged to current state
   * @param forceCommit if true, commit all changes after merging
   */
  mergeState(partialState: State extends object ? Partial<State> : never, forceCommit?: boolean): void;
};

export type DispatchContext<State> = State extends object
  ? MergeableDispatchContext<State>
  : DispatchContextBase<State>;

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
    const changesMap = new Map<string, unknown>();
    const commit = () => {
      changesMap.size > 0 && manager.commit(changesMap);
      changesMap.clear();
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
      let autoCommit = isRoot;
      const storeName = childAction.store.name;

      const getState = () => (changesMap.get(storeName) || manager.getState(childAction.store)) as DeepReadonly<State>;
      const setState = (updater: StateUpdater<State>, forceCommit: boolean = false) => {
        const state = isStateUpdaterFunction(updater) ? updater(getState()) : updater;
        changesMap.set(storeName, state);
        if (forceCommit) {
          commit();
        }
      };

      const ctx: MergeableDispatchContext<State> = {
        state: getState(),
        getState,
        setState,
        mergeState(partialState, forceCommit) {
          const state = getState() as State;
          if (typeof state !== 'object' || Array.isArray(state)) {
            throw new Error('Merge state only available for object based state');
          }
          setState(Object.assign(Object.create(null), state, partialState), forceCommit);
        },

        commit,
        disableAutoCommit() {
          autoCommit = false;
        },

        getStore: otherStore => (changesMap.get(otherStore.name) as any) || manager.getState(otherStore),
        dispatch: childDispatcher,
      };

      const result = childAction.fn(ctx as DispatchContext<State>, ...childArgs);

      const handleResult = (newState: State | void) => {
        if (newState !== undefined) {
          setState(newState);
        }
        if (autoCommit || rootDone) {
          commit();
        }
        if (process.env.NODE_ENV !== 'production' && manager.devTool) {
          let type = `${childAction.store.name}.${childAction.name || '<unknown>'}`;
          if (!autoCommit) {
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
