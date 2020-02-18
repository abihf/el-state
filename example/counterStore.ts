import { createStore, createAction } from '../src/index';

// util
const sleep = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

async function getResetValue() {
  await sleep(1000);
  return 0;
}

// Counter Store
type CounterState = {
  counter: number;
  loading: boolean;
  interval: NodeJS.Timeout | null;
};
export const counterStore = createStore<CounterState>('counter', {
  counter: 0,
  interval: null,
  loading: false,
});

export const setCounter = createAction(counterStore, ({ state }, counter: number) => ({ ...state, counter }), 'set');

export const resetCounter = createAction(
  counterStore,
  async ({ getState, dispatch, setState }) => {
    setState({ ...getState(), loading: true }, true);
    const resetValue = await getResetValue();
    dispatch(setCounter(resetValue));
    setState({ ...getState(), loading: false }, true);
  },
  'reset'
);

export const increaseCounter = createAction(
  counterStore,
  ({ state }) => ({ ...state, counter: state.counter + 1 }),
  'increase'
);

export const startCounter = createAction(
  counterStore,
  ({ setState, dispatch, commit }) => {
    dispatch(stopCounter());
    const interval = setInterval(() => {
      dispatch(increaseCounter());
      commit();
    }, 1000);
    setState(state => ({ ...state, interval }));
  },
  'start'
);

export const stopCounter = createAction(
  counterStore,
  ({ state }) => {
    if (state.interval) clearInterval(state.interval);
    return { ...state, interval: null };
  },
  'stop'
);
