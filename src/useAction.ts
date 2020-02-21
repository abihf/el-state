import { Action, ActionPromise } from './action';
import { useDispatcher } from './dispatcher';
import { SyntheticEvent, useCallback } from 'react';

type ArgMapper<Args extends any[], Event> = (event: Event) => Args;

export function useActionCallback<Event = SyntheticEvent>(
  action: Action<any, []> | ActionPromise<any, []>
): (event: Event) => void;

export function useActionCallback<Args extends [any, ...any[]], Event = SyntheticEvent>(
  action: Action<any, Args> | ActionPromise<any, Args>,
  remapArg: ArgMapper<Args, Event>,
  deps?: any[]
): (event: Event) => void;

export function useActionCallback<Args extends any[], Event = SyntheticEvent>(
  action: Action<any, Args>,
  remapArg?: ArgMapper<Args, Event>,
  deps: any[] = []
): (event: Event) => void {
  const dispatch = useDispatcher();
  return useCallback(
    (event: Event) => {
      const args = remapArg ? remapArg(event) : (([] as unknown) as Args);
      dispatch(action, ...args);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, action, ...deps] // remapArg maybe recreated, use deps instead
  );
}

export function useAction<Args extends any[]>(action: Action<any, Args> | ActionPromise<any, Args>, ...args: Args) {
  const dispatch = useDispatcher();
  return useCallback(
    () => {
      dispatch(action, ...args);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, action, ...args] // remapArg maybe recreated, use deps instead
  );
}
