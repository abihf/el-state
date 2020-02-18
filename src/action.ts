import { ActionContext } from './dispatcher';
import { Store } from './store';

type ActionReturn<State> = State | void;

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

  /**
   * arguments when this action called
   * @internal
   */
  args: any[];
};

export type Action<State> = ActionBase<State> & {
  call(ctx: ActionContext<State>): ActionReturn<State>;
};

export type ActionPromise<State> = ActionBase<State> & {
  call(ctx: ActionContext<State>): Promise<ActionReturn<State>>;
};

export type ActionCreator<State, Args extends any[]> = (
  ctx: ActionContext<State>,
  ...args: Args
) => ActionReturn<State>;
export type ActionPromiseCreator<State, Args extends any[]> = (
  ctx: ActionContext<State>,
  ...args: Args
) => Promise<State>;
export type ActionPromiseCreatorVoid<State, Args extends any[]> = (
  ctx: ActionContext<State>,
  ...args: Args
) => Promise<void>; // some how typescript can't inver ActionReturn

export type ActionFunction<State, Args extends any[]> = (...args: Args) => Action<State>;
export type ActionPromiseFunction<State, Args extends any[]> = (...args: Args) => ActionPromise<State>;

/**
 * Create synchronous action.
 *
 * @param store store that associated to this action
 * @param action function that manipulate the state of the store
 * @param name this is only for debugging purpose.
 */
export function createAction<State, Args extends any[]>(
  store: Store<State>,
  action: ActionCreator<State, Args>,
  name?: string
): ActionFunction<State, Args>;

/**
 * This is asynchornouse version of `createAction()` that return a promise to new state
 *
 * @param store store that associated to this action
 * @param action function that manipulate the state of the store
 * @param name this is only for debugging purpose.
 */
export function createAction<State, Args extends any[]>(
  store: Store<State>,
  action: ActionPromiseCreator<State, Args>,
  name?: string
): ActionPromiseFunction<State, Args>;

/**
 * This is asynchornouse version of `createAction()`
 *
 * @param store store that associated to this action
 * @param action function that manipulate the state of the store
 * @param name this is only for debugging purpose.
 */
export function createAction<State, Args extends any[]>(
  store: Store<State>,
  action: ActionPromiseCreatorVoid<State, Args>,
  name?: string
): ActionPromiseFunction<State, Args>;

export function createAction<State, Args extends any[]>(
  store: Store<State>,
  action: ActionCreator<State, Args>,
  name?: string
): ActionFunction<State, Args> {
  return (...args: Args) => ({
    store,
    call: ctx => action(ctx, ...args),
    name,
    args,
  });
}
