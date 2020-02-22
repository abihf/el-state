import * as React from 'react';
import { createStoreManager, GlobalStates, StoreManager } from './manager';

// React context
const Context = React.createContext<StoreManager | undefined>(undefined);

export const StoreManagerProvider = Context.Provider;

type ProviderProps = {
  initialStates?: GlobalStates;
  enableDevTool?: boolean;
};

export const StoreProvider: React.FC<ProviderProps> = ({ initialStates, enableDevTool, ...props }) => {
  const manager = React.useMemo(() => createStoreManager(initialStates, enableDevTool), [initialStates, enableDevTool]);
  React.useEffect(() => () => manager.devTool?.disconnect());

  return <StoreManagerProvider {...props} value={manager} />;
};

export function useStoreManager() {
  const ctx = React.useContext(Context);
  if (!ctx) {
    throw new Error('Not inside provider');
  }
  return ctx;
}
