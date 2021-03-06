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

export const setCounter = createAction(
  counterStore,
  ({ mergeState }, counter: number) => mergeState({ counter }),
  'set'
);

export const resetCounter = createAction(counterStore, async function reset({ dispatch, mergeState, bulkUpdate }) {
  mergeState({ loading: true });
  const resetValue = await getResetValue();
  bulkUpdate(() => {
    dispatch(setCounter, resetValue);
    mergeState({ loading: false });
  });
});

export const increaseCounter = createAction(
  counterStore,
  ({ state }) => ({ ...state, counter: state.counter + 1 }),
  'increase'
);

export const startCounter = createAction(
  counterStore,
  ({ mergeState, dispatch }) => {
    dispatch(stopCounter);
    const interval = setInterval(() => {
      dispatch(increaseCounter);
    }, 1000);
    mergeState({ interval });
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
