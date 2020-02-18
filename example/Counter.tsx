import * as React from 'react';
import { useStore, useAction, useDispatcher, arrayComparator } from 'el-state';

import { counterStore, setCounter, resetCounter, increaseCounter, stopCounter, startCounter } from './counterStore';

export function Counter() {
  return (
    <div>
      <Display />
      <Control />
      <StartStop />
    </div>
  );
}

function Display() {
  const [counter, loading] = useStore(counterStore, state => [state.counter, state.loading], arrayComparator);
  const set = useAction(setCounter);
  return (
    <div>
      Counter: <input value={counter} disabled={loading} onChange={e => set(parseInt(e.currentTarget.value, 10))} />
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
