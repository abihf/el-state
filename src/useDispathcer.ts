import { useStoreManager } from './provider';
import { Dispatcher, createDispatcher } from './dispatcher';

export function useDispatcher(): Dispatcher {
  const manager = useStoreManager();
  let dispatcher = manager.dispatcher;
  if (!dispatcher) {
    dispatcher = createDispatcher(manager);
    manager.dispatcher = dispatcher;
  }
  return dispatcher;
}
