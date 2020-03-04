import { createAction, getFullActionName } from './action';
import { createStore } from './store';
import { DispatchContext } from './dispatcher';

const store = createStore('store', 0);

describe('action', () => {
  it('create simple action', () => {
    const action = createAction(store, ({ state }) => state + 1, 'action');
    expect(getFullActionName(action)).toBe('store.action');

    const result = action.fn({ state: 0 } as DispatchContext<number>);
    expect(result).toBe(1);
  });
});
