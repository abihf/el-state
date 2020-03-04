import { createAction } from './action';
import { createDispatcher } from './dispatcher';
import { createStoreManager } from './manager';
import { createStore } from './store';

const store = createStore('store', 0);
const action = createAction(store, ({ state }) => state + 1);

test('Dispatcher', () => {
  const manager = createStoreManager();
  const getStateSpy = jest.spyOn(manager, 'getState');
  const commitSpy = jest.spyOn(manager, 'commit');

  const dispatch = createDispatcher(manager);
  dispatch(action);

  expect(getStateSpy).toBeCalledWith(store);
  expect(commitSpy).toBeCalledTimes(1);

  const newState = manager.getState(store);
  expect(newState).toBe(1);
});
