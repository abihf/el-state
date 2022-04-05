import { createStore, createAction } from '../src/';
import { setCounter } from './counterStore';

export const nameStore = createStore('name', () => '');

export const setName = createAction(nameStore, 'set', (ctx, name: string) => {
  if (name === 'xyz') {
    ctx.dispatch(setCounter, 100);
  }
  return name;
});

export const resetName = createAction(nameStore, 'reset', () => '');
