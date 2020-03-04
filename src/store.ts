export type StateInitiator<T> = T | StateInitiatorFunction<T>;
export type StateInitiatorFunction<T> = () => T;

export type Store<State> = {
  readonly name: string;
  readonly initState: StateInitiatorFunction<State>;
};

export function createStore<State>(name: string, initialState: StateInitiator<State>): Store<State> {
  return {
    name,
    initState: isInitiatorFunction(initialState) ? initialState : () => initialState,
  };
}

function isInitiatorFunction<State>(x: StateInitiator<State>): x is StateInitiatorFunction<State> {
  return typeof x === 'function';
}
