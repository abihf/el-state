import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import {
  createAction,
  createSelector,
  createStore,
  StoreProvider,
  useAction,
  useActionCallback,
  useDispatcher,
  useStore,
} from './index';

// counter store
const counterStore = createStore('test.integration.counter', 0);
const setCounter = createAction(counterStore, (_, value: number) => value);
const resetCounter = createAction(counterStore, (ctx) => ctx.dispatch(setCounter, 0));
const increaseCounter = createAction(counterStore, (ctx) => ctx.state + 1);

// name store
const nameStore = createStore('test.integration.name', () => '');
const setName = createAction(nameStore, (ctx, name: string) => {
  if (name === 'xyz') {
    ctx.dispatch(setCounter, 100);
  }
  return name;
});

const SimpleCounter = () => {
  const counter = useStore(counterStore, (counter) => String(counter));
  const dispatch = useDispatcher();
  const reset = useAction(resetCounter);
  return (
    <div>
      <div data-testid="counter">{counter}</div>
      <button onClick={() => dispatch(increaseCounter)} data-testid="btn-increase" />
      <button onClick={reset} data-testid="btn-reset" />
    </div>
  );
};

const NameInput = () => {
  const name = useStore(nameStore);
  const onChange = useActionCallback(setName, (e: React.ChangeEvent<HTMLInputElement>) => [e.target.value]);

  return <input data-testid="input-name" value={name} onChange={onChange} />;
};

const useSelector = createSelector(nameStore, counterStore)(([name, counter]) => `${name}-${counter}`);

const Combined = () => {
  const combined = useSelector();
  return <div data-testid="combined">{combined}</div>;
};

describe('el-state', () => {
  it('should update the states', async () => {
    const states = new Map();
    const { getByTestId } = render(
      <StoreProvider initialStates={states}>
        <SimpleCounter />
        <NameInput />
        <Combined />
      </StoreProvider>
    );

    const counterElement = getByTestId('counter');
    const inputNameElement = getByTestId('input-name') as HTMLInputElement;
    const combinedElement = getByTestId('combined');

    // initialized
    expect(counterElement.textContent).toMatch('0');

    // increase
    fireEvent.click(getByTestId('btn-increase'));
    expect(counterElement.textContent).toMatch('1');

    // set name & side effect?

    fireEvent.change(inputNameElement, { target: { value: 'xyz' } });
    expect(counterElement.textContent).toMatch('100');
    expect(inputNameElement.value).toMatch('xyz');

    // reset
    fireEvent.click(getByTestId('btn-reset'));
    expect(counterElement.textContent).toMatch('0');
    expect(combinedElement.textContent).toMatch('xyz-0');
  });
});
