import * as React from 'react';
import { useAction, useActionCallback, useStore } from '../src/';
import { nameStore, resetName, setName } from './nameStore';

export function NameForm() {
  const name = useStore(nameStore);
  const onChange = useActionCallback(setName, (e: React.ChangeEvent<HTMLInputElement>) => [e.target.value]);
  const onReset = useAction(resetName);
  return (
    <div>
      Name:
      <input value={name} onChange={onChange} />
      <button onClick={onReset}>Reset</button>
    </div>
  );
}
