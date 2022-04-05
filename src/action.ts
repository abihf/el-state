import { DispatchContext } from './dispatcher';
import { Store } from './store';

export interface Action<State, Args extends any[]> {
  /**
   * store that associated to this action
   */
  store: Store<State>;

  /**
   * name of this action
   * @internal
   */
  name?: String;

  /**
   * the real action function
   */
  fn: ActionFunction<State, Args>;
}

export type ActionFunction<State, Args extends any[]> = (
  ctx: DispatchContext<State>,
  ...args: Args
) => ActionReturn<State>;

type ActionReturn<State> = State | void | Promise<void>;

/**
 * Create action.
 *
 * @template State
 * @param store store that associated to this action
 * @param action function that manipulate the state of the store
 */
export function createAction<State, Args extends any[]>(
  store: Store<State>,
  fn: ActionFunction<State, Args>
): Action<State, Args>;

/**
 * Create named action.
 *
 * @param store store that associated to this action
 * @param name this is only for debugging purpose.
 * @param action function that manipulate the state of the store
 */
export function createAction<State, Args extends any[]>(
  store: Store<State>,
  name: string,
  fn: ActionFunction<State, Args>
): Action<State, Args>;

// implementation
export function createAction<State, Args extends any[]>(
  store: Store<State>,
  arg1: string | ActionFunction<State, Args>,
  arg2?: ActionFunction<State, Args>
): Action<State, Args> {
  if (typeof arg1 === 'string') {
    return { store, name: arg1, fn: arg2! };
  }
  return { store, fn: arg1 };
}

export function getFullActionName<Args extends any[]>(action: Action<any, Args>): string {
  const name = action.name || action.fn.name || '<unknown>';
  return `${action.store.name}.${name}`;
}
