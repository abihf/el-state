import * as React from 'react';
import { createSelector } from '../src/index';

import { counterStore } from './counterStore';
import { nameStore } from './nameStore';

type Props = {
  extra: string;
};

const useSelector = createSelector((getStore, extra: string) => {
  const counter = getStore(counterStore);
  const name = getStore(nameStore);
  return `Counter ${counter.counter}, Name: ${name}. ${extra}`;
});

export function Combined({ extra }: Props) {
  const combined = useSelector(extra);
  return <b>{combined}</b>;
}
