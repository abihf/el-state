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

ReactDOM.render(<StoreProvider><App /></StoreProvider>, document.getElementById('root'));
```

### Define a store
```ts
import { createStore, createState } from 'el-state';

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
```

### Use the store
```js
const MyComononent: React.FC = () => {
  const counter = useStore(counterStore, state => state.counter);

  // use the counter
}
```

### Call an action
```js
const MyComononent: React.FC = () => {
  const increaseCounter = useAction(counterStore.increase);
  // use this function as onClick handle
}
```

### Use dispatcher
```js
const MyComononent: React.FC = () => {
  const dispatch = useDispatcher();

  const onBtnIncreasePressed = () => dispatch(counterStore.increase());
  // use this function as onClick handle
}
```