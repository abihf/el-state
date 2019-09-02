import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { StoreProvider, createStore, useStore, useAction, useStores, createState } from '../.';

type CounterState = {
  counter: number;
};
const counterStore = createStore({
  initialState: createState<CounterState>({ counter: 0 }),
  actions: {
    increase(ctx) {
      // ctx.state.counter++; // => compile error: counter is readonly
      ctx.setState(state => ({ counter: state.counter + 1 }));
    },
    set(ctx, counter: number) {
      ctx.setState({ counter });
    },
    reset(ctx) {
      this.set(ctx, 0);
    },
  },
});

const nameStore = createStore({
  initialState: createState<string>(''),
  actions: {
    set(ctx, name: string) {
      ctx.setState(name);
      if (name === 'abihf') {
        ctx.dispatch(counterStore.set(999));
      }
    },
    reset(ctx) {
      this.set(ctx, '');
    },
  },
});

const App = () => (
  <div>
    <Display />
    <Control />
    <hr />
    <NameForm />
    <hr />
    <Combine />
  </div>
);

function Display() {
  const counter = useStore(counterStore, state => state.counter);
  const set = useAction(counterStore.set);
  return (
    <div>
      Counter: <input value={counter} onChange={e => set(parseInt(e.currentTarget.value))} />
    </div>
  );
}

function Control() {
  const increase = useAction(counterStore.increase());
  const reset = useAction(counterStore.reset());

  return (
    <div>
      Counter Control:
      <button onClick={increase}>Increase</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

function NameForm() {
  const name = useStore(nameStore);
  const set = useAction(nameStore.set);
  const reset = useAction(nameStore.reset());
  return (
    <div>
      Name:
      <input value={name} onChange={e => set(e.currentTarget.value)} />
      <button onClick={reset}>Reset</button>
    </div>
  );
}

function Combine() {
  const combined = useStores(
    { counter: counterStore, name: nameStore },
    ({ counter, name }) => `Counter ${counter.counter}, Name: ${name}`
  );
  return <b>{combined}</b>;
}

ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById('root')
);
