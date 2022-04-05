import React, { useContext, useEffect, useMemo } from 'react';
import { createStoreManager, GlobalStates, StoreManager } from './manager';

// React context
const Context = React.createContext<StoreManager | undefined>(undefined);

export const StoreManagerProvider = Context.Provider;

interface ProviderProps {
  /**
   * Initial global state. Used for client side hidration
   */
  initialStates?: GlobalStates;

  /**
   * Use custom {@Link StoreManager | StoreManager}
   */
  manager?: StoreManager;

  /**
   * Enable Redux dev tool integration
   */
  enableDevTool?: boolean;
}

export const StoreProvider: React.FC<ProviderProps> = ({
  initialStates,
  enableDevTool,
  manager: customManager,
  ...props
}) => {
  const manager = useMemo(() => customManager || createStoreManager(initialStates, enableDevTool), [
    customManager,
    initialStates,
    enableDevTool,
  ]);
  useEffect(() => () => manager.devTool?.disconnect(), [manager]);

  return <StoreManagerProvider {...props} value={manager} />;
};

export function useStoreManager() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error('You must wrap the component with <StoreProvider>');
  }
  return ctx;
}
