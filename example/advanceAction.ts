import { createStore, createAction, Store, Action, ActionFunction } from '../src/';
import produce, { Draft } from 'immer';

type State = {
  a: number;
  b: string;
};

export const advanceStore = createStore<State>('advance', { a: 0, b: '' });

function createImmerAction<State extends object, Args extends any[]>(
  store: Store<State>,
  fn: (state: Draft<State>, ...args: Args) => void
): Action<State, Args> {
  return {
    store,
    fn: (ctx, ...args) => {
      const newState = produce(ctx.state as State, state => fn(state, ...args));
      ctx.setState(newState);
    },
  };
}

export const setA = createImmerAction(advanceStore, state => {
  // you can now just assign value to state props
  state.a = 5;
});
