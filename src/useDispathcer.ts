import { useStoreManager } from './provider';
import { Dispatcher } from './dispatcher';

export function useDispatcher(): Dispatcher {
  const manager = useStoreManager();
  return manager.dispatcher;
}
