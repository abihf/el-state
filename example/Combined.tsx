import * as React from 'react';
import { useStore, combineStore } from 'el-state';

import { counterStore } from './counterStore';
import { nameStore } from './nameStore';

const allStore = combineStore(counterStore, nameStore);
export function Combined() {
  const combined = useStore(allStore, ([counter, name]) => `Counter ${counter.counter}, Name: ${name}`);
  return <b>{combined}</b>;
}
