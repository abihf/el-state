import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { createAction } from './action';
import { useAction, useDispatcher } from './dispatcher';
import { StoreProvider } from './provider';
import { createStore } from './store';
import { combineStore, useStore } from './useStore';

// counter store
const counterStore = createStore('counter', 0);
const setCounter = createAction(counterStore, (_, value: number) => value);
const resetCounter = createAction(counterStore, ctx => ctx.dispatch(setCounter(0)));
const increaseCounter = createAction(counterStore, ctx => ctx.state + 1);

// name store
const nameStore = createStore('name', () => '');
const setName = createAction(nameStore, async (ctx, name: string) => {
  if (name === 'xyz') {
    await ctx.dispatch(setCounter(100));
  }
  return name;
});

const SimpleCounter = () => {
  const counter = useStore(counterStore, counter => String(counter));
  const dispatch = useDispatcher();
  const reset = useAction(resetCounter());
  return (
    <div>
      <div data-testid="counter">{counter}</div>
      <button onClick={() => dispatch(increaseCounter())} data-testid="btn-increase" />
      <button onClick={reset} data-testid="btn-reset" />
    </div>
  );
};

const NameInput = () => {
  const name = useStore(nameStore);
  const setNameAction = useAction(setName);

  return <input data-testid="input-name" value={name} onChange={e => setNameAction(e.target.value)} />;
};

const Combined = () => {
  const [name, counter] = useStore(combineStore(nameStore, counterStore));
  return (
    <div data-testid="combined">
      {name}-{counter}
    </div>
  );
};

describe('el-state', () => {
  it('should update the states', async () => {
    jest.useFakeTimers();

    const states = new Map();
    const { getByTestId, findByTestId } = render(
      <StoreProvider initialStates={states}>
        <SimpleCounter />
        <NameInput />
        <Combined />
      </StoreProvider>
    );

    // initialized
    expect((await findByTestId('counter')).textContent).toMatch('0');

    // increase
    fireEvent.click(getByTestId('btn-increase'));
    expect((await findByTestId('counter')).textContent).toMatch('1');

    // set name & side effect?
    const inputElement = getByTestId('input-name') as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: 'xyz' } });
    expect((await findByTestId('counter')).textContent).toMatch('100');
    expect(inputElement.value).toMatch('xyz');

    // reset
    fireEvent.click(getByTestId('btn-reset'));
    expect((await findByTestId('counter')).textContent).toMatch('0');
    expect((await findByTestId('combined')).textContent).toMatch('xyz-0');
  });
});