import * as React from 'react';
import { useStore, useAction } from '../src/index';

import { nameStore, setName, resetName } from './nameStore';

export function NameForm() {
  const name = useStore(nameStore);
  const set = useAction(setName);
  const reset = useAction(resetName);
  return (
    <div>
      Name:
      <input value={name} onChange={e => set(e.currentTarget.value)} />
      <button onClick={reset}>Reset</button>
    </div>
  );
}
