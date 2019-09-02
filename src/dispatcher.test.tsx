import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { createStore } from './createStore';
import { useAction, useDispatcher } from './dispatcher';
import { createGlobalStates, extractGlobalStates, StoreProvider } from './provider';

const store = createStore({
  initialState: 0,
  actions: {
    increase({ setState }) {
      setState(state => state + 1);
    },
    reset({ setState }) {
      setState(0);
    },
  },
});

const SimpleCounter = () => {
  const dispatch = useDispatcher();
  const reset = useAction(store.reset());
  return (
    <div>
      <button onClick={() => dispatch(store.increase())} data-testid="btn-increase" />
      <button onClick={reset} data-testid="btn-reset" />
    </div>
  );
};

describe('useDispatcher', () => {
  it('should update the states', () => {
    const states = createGlobalStates();
    const { queryByTestId } = render(
      <StoreProvider states={states}>
        <SimpleCounter />
      </StoreProvider>
    );

    // states is still empty
    expect(extractGlobalStates(states, { x: store })).toMatchObject({});

    // increase
    fireEvent.click(queryByTestId('btn-increase')!);
    expect(extractGlobalStates(states, { x: store })).toMatchObject({ x: 1 });

    // increase
    fireEvent.click(queryByTestId('btn-increase')!);
    expect(extractGlobalStates(states, { x: store })).toMatchObject({ x: 2 });

    // reset
    fireEvent.click(queryByTestId('btn-reset')!);
    expect(extractGlobalStates(states, { x: store })).toMatchObject({ x: 0 });
  });
});
