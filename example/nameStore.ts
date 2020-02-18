import { createStore, createAction } from '../src/index';
import { setCounter } from './counterStore';

export const nameStore = createStore('name', () => '');

export const setName = createAction(
  nameStore,
  async (ctx, name: string) => {
    if (name === 'xyz') {
      ctx.dispatch(setCounter(100));
    }
    return name;
  },
  'set'
);

export const resetName = createAction(nameStore, () => '', 'reset');
