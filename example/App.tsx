import * as React from 'react';
import { StoreProvider } from 'el-state';

import { Counter } from './Counter';
import { NameForm } from './NameForm';
import { Combined } from './Combined';

export const App = () => (
  <React.StrictMode>
    <StoreProvider enableDevTool={true}>
      <Counter />
      <hr />
      <NameForm />
      <hr />
      <Combined />
      <hr />
      <a href="https://github.com/abihf/el-state" target="_blank" rel="noopener noreferrer">
        GitHub
      </a>
    </StoreProvider>
  </React.StrictMode>
);
