import { SubscriptionSet } from './manager';

export interface DevTool {
  log(action: object): void;
  disconnect(): void;
}

export function initDevTool(
  states: Map<string, unknown>,
  subscriptions: Map<string, SubscriptionSet>
): DevTool | undefined {
  if (process.env.NODE_ENV === 'production') {
    return undefined;
  }

  const ext: ReduxDevToolExtension =
    typeof window !== undefined ? (window as any).__REDUX_DEVTOOLS_EXTENSION__ : undefined;
  if (!ext) return undefined;

  const connection = ext.connect({
    name: 'el-state',
    features: {
      pause: true, // start/pause recording of dispatched actions
      lock: true, // lock/unlock dispatching actions and side effects
      export: true, // export history of actions in a file
      import: 'custom', // import history of actions from a file
      jump: true, // jump back and forth (time travelling)

      skip: false, // Cannot skip for we cannot replay.
      reorder: false, // Cannot skip for we cannot replay.
      persist: false, // Avoid trying persistence.
      dispatch: false,
      test: false,
    },
  });
  connection.init(mapToObject(states));
  connection.subscribe(({ type, state, payload }) => {
    if (type === 'DISPATCH' && (payload.type === 'JUMP_TO_STATE' || payload.type === 'JUMP_TO_ACTION')) {
      const obj = JSON.parse(state);
      states.clear();
      const allSubscription: SubscriptionSet = new Set();
      for (const key in obj) {
        states.set(key, obj[key]);
        subscriptions.get(key)?.forEach(fn => allSubscription.add(fn));
      }
      allSubscription.forEach(fn => fn());
    }
  });
  return {
    log(action) {
      connection.send(action, mapToObject(states));
    },
    disconnect() {
      ext.disconnect(connection);
    },
  };
}

function mapToObject(map: Map<string, unknown>) {
  const obj = {} as Record<string, unknown>;
  map.forEach((value, key) => (obj[key] = value));
  return obj;
}

interface ReduxDevToolExtension {
  connect(options: object): ReduxDevToolConnection;
  disconnect(connection: ReduxDevToolConnection): void;
}

interface ReduxDevToolConnection {
  init(state: object): void;
  subscribe(cb: ReduxDevtoolSubscription): void;
  send(action: object, state?: object): void;
}

type ReduxDevtoolSubscription = (data: { type: string; state: string; payload: { type: string } }) => void;
