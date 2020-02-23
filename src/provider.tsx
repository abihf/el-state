import React, { useContext, useEffect, useMemo } from 'react';
import { createStoreManager, GlobalStates, StoreManager } from './manager';

// React context
const Context = React.createContext<StoreManager | undefined>(undefined);

export const StoreManagerProvider = Context.Provider;

type ProviderProps = {
  initialStates?: GlobalStates;
  enableDevTool?: boolean;
};

export const StoreProvider: React.FC<ProviderProps> = ({ initialStates, enableDevTool, ...props }) => {
  const manager = useMemo(() => createStoreManager(initialStates, enableDevTool), [initialStates, enableDevTool]);
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
