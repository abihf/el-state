# ![nachos](https://img.icons8.com/officel/30/000000/nachos.png) él-staté

Type safe state management for React.

## Features

- Type safe: every state & action can be typed.
- Distributed store: no `combineReducers` to create root reducer. You can select multiple stores in single component. Action can dispatch other actions that belong to different store.
- Reducer-less, full of action. You dispatch action that manipulate the state it self.
- Lazy store initialization: stores will not be initialized until it used on component or action.
- Tree shakable: unneeded actions & stores will not be bundled.

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

// Store
export const counterStore = createStore<CounterState>('counter', { counter: 0 });

// Update state by merging
export const setCounter = createAction(counterStore, ({ mergeState }, counter: number) => mergeState({ counter }));

// Dispatch other action. You can also dispatch action that belong to different store
export const resetCounter = createAction(counterStore, ({ dispatch }) => dispatch(setCounter, 0));

// Update state by returning new one. You can't mutate `state` because it's read only.
export const increaseCounter = createAction(counterStore, ({ state }) => ({ ...state, counter: state.counter + 1 }));
```

### Use the store

```jsx
function MyComponent() {
  const counter: number = useStore(counterStore, state => state.counter);

  // use the counter
  return <div>{counter}</div>;
}
```

### Select multiple store

```jsx
const useSelector = createSelector(getStore => {
  const { counter } = getStore(counterStore);
  const { name } = getStore(accountStore);

  return counter > 1 ? name : ""; 
});

function MyComponent() {
  // this component will only rerender if the value of useSelector changed
  // it will not rerender when the counterStore updated from 1 to 2
  const name = useSelector();

  // use the counter
  return <div>{name}</div>;
}

```

### Call an action

```jsx
function MyComponent() {
  const onIncrease = useAction(increaseCounter);

  // use this function as onClick handle
  <button onClick={onIncrease}>Increase</button>;
}
```

Or

```jsx
function MyComponent() {
  const dispatch = useDispatcher();

  const onIncrease = () => dispatch(increaseCounter);
  // use this function as onClick handle
}
```

### Create event handler

```jsx
function MyComponent() {
  const onChange = useActionCallback(setCounter, (e: React.ChangeEvent<HTMLInputElement>) => [
    parseInt(e.target.value, 10), // you must parse the value, because first argument of setCounter is number
  ]);

  // use this function as event handler
  return <input value={counter} onChange={onChange} />;
}
```

## Attribution

[Nachos icon by Icons8](https://icons8.com/icon/36KGWdxi97kQ/nachos)
