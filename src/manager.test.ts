import { createStoreManager } from './manager';
import { createStore } from './store';

const store = createStore('store', () => 0);

test('storeManager', () => {
  const manager = createStoreManager();

  // initial value
  expect(manager.getState(store)).toBe(0);

  manager.commit(new Map([['store', 100]]));
  expect(manager.getState(store)).toBe(100);
});
