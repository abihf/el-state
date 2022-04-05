import { createStore, createAction } from '../src/';

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

export const setCounter = createAction(counterStore, 'set', ({ mergeState }, counter: number) =>
  mergeState({ counter })
);

export const resetCounter = createAction(counterStore, async function reset({ dispatch, mergeState, bulkUpdate }) {
  mergeState({ loading: true });
  const resetValue = await getResetValue();
  bulkUpdate(() => {
    dispatch(setCounter, resetValue);
    mergeState({ loading: false });
  });
});

export const increaseCounter = createAction(counterStore, 'increase', ({ state }) => ({
  ...state,
  counter: state.counter + 1,
}));

export const startCounter = createAction(counterStore, 'start', ({ mergeState, dispatch }) => {
  dispatch(stopCounter);
  const interval = setInterval(() => {
    dispatch(increaseCounter);
  }, 1000);
  mergeState({ interval });
});

export const stopCounter = createAction(counterStore, 'stop', ({ state }) => {
  if (state.interval) clearInterval(state.interval);
  return { ...state, interval: null };
});
