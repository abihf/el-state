export type StateInitiator<T> = T | StateInitiatorFunction<T>;
export type StateInitiatorFunction<T> = () => T;

export type Store<State> = {
  readonly name: string;
  readonly initialState: StateInitiator<State>;
};

export function createStore<State>(name: string, initialState: StateInitiator<State>): Store<State> {
  return {
    name,
    initialState,
  };
}
