export type Store<State, Actions extends ActionMap<State>> = StoreActionsMap<State, Actions> & {
  readonly _storeData: StoreData<State>;
};

export type StoreData<State> = {
  readonly initialState: State;
};

export type StoreActionsMap<State, Actions extends ActionMap<State>> = {
  [i in keyof Actions]: (...args: ActionParameters<Actions[i]>) => DispatchFunction<State, ActionReturn<Actions[i]>>;
};


export type ActionMap<State> = Record<string, ActionFunction<State>>;

export type ActionFunction<State, Args extends any[] = any[], R = any> = (
  ctx: ActionFuncContext<State>,
  ...args: Args
) => R;
export type ActionFuncContext<State> = {
  state: DeepReadonly<State>;
  getState(): DeepReadonly<State>;
  setState(updater: StateUpdater<DeepReadonly<State>>, forceCommit?: boolean): void;

  disableAutoCommit(): void;
  commit(): void;

  getStore<OtherState>(store: Store<OtherState, ActionMap<OtherState>>): OtherState;
  dispatch: Dispatcher;
};

export type StateUpdaterFunction<State> = (prev: State) => State;
export type StateUpdater<State> = State | StateUpdaterFunction<State>;
export type StateComparator<T> = (prev: T, current: T) => boolean;

type ActionReturn<Action extends ActionFunction<any>> = Action extends ActionFunction<any, any, infer R>
  ? R
  : unknown;
type ActionParameters<Action extends ActionFunction<any>> = Action extends ActionFunction<any, infer Args, any>
  ? Args
  : unknown[];

export type Dispatcher = <State, Return = any>(fn: DispatchFunction<State, Return>) => Return;
export type DispatchFunction<State, Return> = {
  (ctx: ActionFuncContext<State>): Return;
  store: StoreData<State>;
};


export type SubscriptionFn = () => void;
export type SubscriptionSet = Set<SubscriptionFn>;



// utils
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
