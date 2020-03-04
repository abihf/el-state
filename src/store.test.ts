import { createStore } from './store';

describe('createStore', () => {
  it('returns store object', () => {
    const store = createStore('test-0', 0);
    expect(store).toBeInstanceOf(Object);
    expect(store).toMatchObject({ name: 'test-0' });
    expect(store.initState()).toEqual(0);
  });
});
