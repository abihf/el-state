export type StateInitiator<T> = T | StateInitiatorFunction<T>;
export type StateInitiatorFunction<T> = () => T;

export type Store<State> = {
  readonly name: string;
  readonly initState: StateInitiatorFunction<State>;
};

let storeImplementation: Map<string, string>;

export function createStore<State>(name: string, initialState: StateInitiator<State>): Store<State> {
  if (process.env.NODE_ENV !== 'production') {
    storeImplementation = storeImplementation || new Map();
    const oldLocation = storeImplementation.get(name);
    const newLocation = new Error().stack?.split('\n')[2]?.trim() ?? 'at unknown location';
    if (oldLocation !== undefined && oldLocation !== newLocation) {
      throw new Error(`Store with name "${name}" has already been declared ${storeImplementation.get(name)}`);
    }
    storeImplementation.set(name, newLocation);
  }
  return {
    name,
    initState: isInitiatorFunction(initialState) ? initialState : () => initialState,
  };
}

function isInitiatorFunction<State>(x: StateInitiator<State>): x is StateInitiatorFunction<State> {
  return typeof x === 'function';
}
