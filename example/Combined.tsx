import * as React from 'react';
import { createSelector } from '../src/';

import { counterStore } from './counterStore';
import { nameStore } from './nameStore';

type Props = {
  extra: string;
};

const useSelector = createSelector(
  counterStore,
  nameStore
)(([counter, name], extra: string) => {
  return `Counter ${counter.counter}, Name: ${name}. ${extra}`;
});

export function Combined({ extra }: Props) {
  const combined = useSelector(extra);
  return <b>{combined}</b>;
}
