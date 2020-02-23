import { SyntheticEvent, useCallback } from 'react';
import { Action, ActionPromise } from './action';
import { useDispatcher } from './useDispathcer';

type ArgMapper<Args extends any[], Event> = (event: Event) => Args;

/**
 * Use action with static arguments. If you need dynamic argument, use {@link useDispatcher} instead,
 * or {@link useActionCallback} if you want to use it as component callback paramater
 *
 * @param action Action that will be called
 * @param args Static action argument
 */
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

/**
 * Use action as callback function.
 *
 * @param action Action that will be called
 * @returns Function that take React synthetic event as argument
 */
export function useActionCallback<Event = SyntheticEvent>(
  action: Action<any, []> | ActionPromise<any, []>
): (event: Event) => void;

/**
 * Use action as callback function and convert the event to action argument.
 *
 * @param action Action that will be called
 * @param remapArg Convert event argument in to action argument array
 * @param deps If remap isn't pure function, list it's dependency here.
 * @returns Function that take event as first argument
 */
export function useActionCallback<Args extends [any, ...any[]], Event = SyntheticEvent>(
  action: Action<any, Args> | ActionPromise<any, Args>,
  remapArg: ArgMapper<Args, Event>,
  deps?: any[]
): (event: Event) => void;

// real implementation
export function useActionCallback<Args extends any[], Event = SyntheticEvent>(
  action: Action<any, Args>,
  remapArg?: ArgMapper<Args, Event>,
  deps: any[] = []
): (event: Event) => void {
  const dispatch = useDispatcher();
  return useCallback(
    (event: Event) => {
      const args = remapArg ? remapArg(event) : (([] as unknown) as Args);
      if (process.env.NODE_ENV !== 'production') {
        // -1 is for dispatch context
        const neededArgLength = action.fn.length - 1;
        if (neededArgLength > args.length) {
          const fullActionName = action.store.name + '.' + action.name || '<unknown>';
          throw new Error(`Action ${fullActionName} needs ${neededArgLength} arguments, but only get ${args.length}`);
        }
      }
      dispatch(action, ...args);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, action, ...deps] // remapArg maybe recreated, use deps instead
  );
}
