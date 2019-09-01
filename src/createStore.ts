import { ActionFuncContext, ActionMap, DispatchFunction, Store, StoreActionsMap, StoreData } from './types';

type CreateStoreOption<State, Actions extends ActionMap<State>> = {
  initialState: State;
  actions: Actions;
};

export function createStore<State, Actions extends ActionMap<State>>({
  initialState,
  actions,
}: CreateStoreOption<State, Actions>): Store<State, Actions>  {
  const data: StoreData<State> = {initialState}
  const transformedAction = Object.keys(actions).reduce((result, key: keyof Actions) => {
    result[key] = (...args: any[]) => {
      const fn: DispatchFunction<State, any> = (ctx: ActionFuncContext<State>) => actions[key](ctx, ...args);
      fn.store = data;
      return fn;
    }
    return result;
  }, {} as StoreActionsMap<State, Actions>)
  return { ...transformedAction, _storeData: data }
}

export function createState<State>(state: State): State {
  return state;
}