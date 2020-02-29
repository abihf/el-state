import { DispatchContext } from './dispatcher';
import { Store } from './store';

type ActionReturn<State> = State | void | Promise<void>;

type ActionBase<State> = {
  /**
   * store that associated to this action
   */
  store: Store<State>;

  /**
   * name of this action
   * @internal
   */
  name?: String;
};

export type Action<State, Args extends any[]> = ActionBase<State> & {
  fn: ActionFunction<State, Args>;
};

export type ActionFunction<State, Args extends any[]> = (
  ctx: DispatchContext<State>,
  ...args: Args
) => ActionReturn<State>;

/**
 * Create synchronous action.
 *
 * @param store store that associated to this action
 * @param action function that manipulate the state of the store
 * @param name this is only for debugging purpose.
 */
export function createAction<State, Args extends any[]>(
  store: Store<State>,
  fn: ActionFunction<State, Args>,
  name?: string
): Action<State, Args> {
  return { store, fn, name };
}

export function getFullActionName<Args extends any[]>(action: Action<any, Args>): string {
  const name = action.name || action.fn.name || '<unknown>';
  return `${action.store.name}.${name}`;
}
