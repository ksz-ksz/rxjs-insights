import { Action, ActionType } from '@lib/state-fx/store';
import { ActionSource } from './action-source';
import { Component, ComponentInstance, Container } from './container';

export interface ActionsSelector<T> {
  select(actions: Actions): T;
}

export interface Actions {
  dispatch(action: Action<any>): void;
  select<T>(selector: ActionsSelector<T>): T;
  ofType<T>(factory: ActionType<T>): ActionSource<T>;
}

class ActionsComponent implements Component<Actions> {
  init(container: Container): ComponentInstance<Actions> {
    return {
      component: createActionsComponent(),
    };
  }
}

function createActionsComponent(): Actions {
  const sources = new Map<string, WeakRef<ActionSource<any>>>();

  function getSource<T>(
    namespace: string,
    name: string,
    create?: true
  ): ActionSource<T>;
  function getSource<T>(
    namespace: string,
    name: string,
    create: false
  ): ActionSource<T> | undefined;
  function getSource<T>(
    namespace: string,
    name: string,
    create = true
  ): ActionSource<T> | undefined {
    const actionKey = `${namespace}::${name}`;
    const source = sources.get(actionKey)?.deref();
    if (source !== undefined) {
      return source;
    } else if (create) {
      const source = new ActionSource<any>(namespace, name);
      sources.set(actionKey, new WeakRef(source));
      return source;
    } else {
      return undefined;
    }
  }

  return {
    dispatch(action: Action<any>) {
      const source = getSource(action.namespace, action.name, false);
      console.log(
        `DISPATCH${source === undefined ? '?' : '!'}`,
        action.namespace,
        action.name,
        action.payload
      );
      source?.dispatchAction(action);
    },
    select<T>(selector: ActionsSelector<T>): T {
      return selector.select(this);
    },
    ofType<T>(factory: ActionType<T>): ActionSource<T> {
      return getSource(factory.namespace, factory.name);
    },
  };
}

export const actionsComponent: Component<Actions> = new ActionsComponent();
