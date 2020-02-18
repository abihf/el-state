# él-staté

React state management with hook

## Usage

Please see [example](./example/index.tsx).

### Use StoreProvider

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { StoreProvider } from 'el-state';
import App from './App';

ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById('root')
);
```

### Define a store & actions

```ts
import { createStore, createState } from 'el-state';

type CounterState = {
  counter: number;
};

export const counterStore = createStore<CounterState>('counter', { counter: 0 });

export const setCounter = createAction(counterStore, ({ state }, counter: number) => ({ ...state, counter }));

export const resetCounter = createAction(counterStore, ({ dispatch }) => dispatch(setCounter(0)));

export const increaseCounter = createAction(counterStore, ({ state }) => ({ ...state, counter: state.counter + 1 }));
```

### Use the store

```jsx
function MyComponent() {
  const counter = useStore(counterStore, state => state.counter);

  // use the counter
}
```

### Call an action

```jsx
function MyComponent() {
  const increase = useAction(increaseCounter);

  // use this function as onClick handle
  <button onClick={() => increase()}>Button</button>;
}
```

### Use dispatcher

```jsx
function MyComponent() {
  const dispatch = useDispatcher();

  const onBtnIncreasePressed = () => dispatch(increaseCounter());
  // use this function as onClick handle
}
```
