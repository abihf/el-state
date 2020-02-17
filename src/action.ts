import { ActionContext } from './dispatcher';
import { Store } from './store';

type ActionReturn<State> = State | void;

type ActionBase<State> = {
  store: Store<State>;
  name?: String;
  args: any[];
};
export type Action<State> = ActionBase<State> & {
  call(ctx: ActionContext<State>): ActionReturn<State>;
};

export type ActionPromise<State> = ActionBase<State> & {
  call(ctx: ActionContext<State>): Promise<ActionReturn<State>>;
};

type ActionCreator<State, Args extends any[]> = (ctx: ActionContext<State>, ...args: Args) => ActionReturn<State>;
type ActionPromiseCreator<State, Args extends any[]> = (ctx: ActionContext<State>, ...args: Args) => Promise<State>;
type ActionPromiseCreatorVoid<State, Args extends any[]> = (ctx: ActionContext<State>, ...args: Args) => Promise<void>; // some how typescript can't inver ActionReturn

export type ActionFunction<State, Args extends any[]> = (...args: Args) => Action<State>;
export type ActionPromiseFunction<State, Args extends any[]> = (...args: Args) => ActionPromise<State>;

export function createAction<State, Args extends any[]>(
  store: Store<State>,
  action: ActionCreator<State, Args>,
  name?: string
): ActionFunction<State, Args>;
export function createAction<State, Args extends any[]>(
  store: Store<State>,
  action: ActionPromiseCreator<State, Args>,
  name?: string
): ActionPromiseFunction<State, Args>;
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
