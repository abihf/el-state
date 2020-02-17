import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  StoreProvider,
  createStore,
  useStore,
  useAction,
  createAction,
  combineStore,
  useDispatcher,
  arrayComparator,
} from '../src/index';

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
const counterStore = createStore<CounterState>('counter', { counter: 0, interval: null, loading: false });
const setCounter = createAction(counterStore, ({ state }, counter: number) => ({ ...state, counter }), 'set');
const resetCounter = createAction(
  counterStore,
  async ({ getState, dispatch, setState }) => {
    setState({ ...getState(), loading: true }, true);
    const resetValue = await getResetValue();
    dispatch(setCounter(resetValue));
    setState({ ...getState(), loading: false }, true);
  },
  'reset'
);
const increaseCounter = createAction(
  counterStore,
  ({ state }) => ({ ...state, counter: state.counter + 1 }),
  'increase'
);
const startCounter = createAction(
  counterStore,
  ({ setState, dispatch, commit }) => {
    // dispatch(stopCounter());
    const interval = setInterval(() => {
      dispatch(increaseCounter());
      commit();
    }, 1000);
    setState(state => ({ ...state, interval }));
  },
  'start'
);
const stopCounter = createAction(
  counterStore,
  ({ state }) => {
    if (state.interval) clearInterval(state.interval);
    return { ...state, interval: null };
  },
  'stop'
);

const nameStore = createStore('name', () => '');
const setName = createAction(
  nameStore,
  async (ctx, name: string) => {
    if (name === 'xyz') {
      ctx.dispatch(setCounter(100));
    }
    return name;
  },
  'set'
);
const resetName = createAction(nameStore, () => '', 'reset');

const App = () => (
  <div>
    <Display />
    <Control />
    <StartStop />
    <hr />
    <NameForm />
    <hr />
    <Combine />
  </div>
);

function Display() {
  const [counter, loading] = useStore(counterStore, state => [state.counter, state.loading], arrayComparator);
  const set = useAction(setCounter);
  return (
    <div>
      Counter: <input value={counter} disabled={loading} onChange={e => set(parseInt(e.currentTarget.value))} />
      {loading ? ' Loading' : null}
    </div>
  );
}

function Control() {
  const isRunning = useStore(counterStore, counter => counter.interval !== null);
  const increase = useAction(increaseCounter());
  const reset = useAction(resetCounter());

  return (
    <div>
      Counter Control:
      <button onClick={increase} disabled={isRunning}>
        Increase
      </button>
      <button onClick={reset} disabled={isRunning}>
        Reset
      </button>
    </div>
  );
}

function StartStop() {
  const isRunning = useStore(counterStore, counter => counter.interval !== null);
  const dispatch = useDispatcher();

  return isRunning ? (
    <button onClick={() => dispatch(stopCounter())}>Stop</button>
  ) : (
    <button onClick={() => dispatch(startCounter())}>Start</button>
  );
}

function NameForm() {
  const name = useStore(nameStore);
  const set = useAction(setName);
  const reset = useAction(resetName);
  return (
    <div>
      Name:
      <input value={name} onChange={e => set(e.currentTarget.value)} />
      <button onClick={reset}>Reset</button>
    </div>
  );
}

const allStore = combineStore(counterStore, nameStore);
function Combine() {
  const combined = useStore(allStore, ([counter, name]) => `Counter ${counter.counter}, Name: ${name}`);
  return <b>{combined}</b>;
}

ReactDOM.render(
  <StoreProvider enableDevTool={true}>
    <App />
  </StoreProvider>,
  document.getElementById('root')
);
