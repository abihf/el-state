import * as React from 'react';
import { useStore, useActionCallback, useAction } from '../src/index';
import equal from 'fast-deep-equal';

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
  const [counter, loading] = useStore(counterStore, state => [state.counter, state.loading], equal);
  console.trace('Counter', counter, loading);
  const onChange = useActionCallback(setCounter, (e: React.ChangeEvent<HTMLInputElement>) => [
    parseInt(e.target.value, 10),
  ]);
  return (
    <div>
      Counter: <input value={counter} disabled={loading} onChange={onChange} />
      {loading ? ' Loading' : null}
    </div>
  );
}

function Control() {
  const isRunning = useStore(counterStore, counter => counter.interval !== null);
  const increase = useAction(increaseCounter);
  const reset = useAction(resetCounter);

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
  const onStart = useAction(startCounter);
  const onStop = useAction(stopCounter);

  return isRunning ? <button onClick={onStop}>Stop</button> : <button onClick={onStart}>Start</button>;
}
