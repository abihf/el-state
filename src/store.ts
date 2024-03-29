export type StateInitiator<T> = T | StateInitiatorFunction<T>;
export type StateInitiatorFunction<T> = () => T;

export interface Store<State> {
  /**
   * name of the store
   */
  readonly name: string;

  /**
   * state initiator
   */
  readonly initState: StateInitiatorFunction<State>;
}

export type StateComparator<T> = (prev: T, current: T) => boolean;

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
