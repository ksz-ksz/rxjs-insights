import { Action, ActionType } from '@lib/state-fx/store';
import { ActionSource } from './action-source';
import { Component, Container, ComponentInstance } from './container';
import { Observable } from 'rxjs';

export interface ActionsSelector<T> {
  select(actions: Actions): T;
}

export interface Actions {
  dispatch(action: Action<any>): void;
  select<T>(selector: ActionsSelector<T>): T;
  of<T>(namespace: string, name: string): ActionSource<T>;
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
  const sources = new Map<string, ActionSource<any>>();

  return {
    dispatch(action: Action<any>) {
      const source = this.of(action.namespace, action.name);
      source.dispatchAction(action);
    },
    select<T>(selector: ActionsSelector<T>): T {
      return selector.select(this);
    },
    of<T>(namespace: string, name: string): ActionSource<T> {
      const actionKey = `${namespace}::${name}`;
      const source = sources.get(actionKey);
      if (source !== undefined) {
        return source;
      } else {
        const source = new ActionSource<any>(namespace, name);
        sources.set(actionKey, source);
        return source;
      }
    },
    ofType<T>(factory: ActionType<T>): ActionSource<T> {
      return this.of(factory.namespace, factory.name);
    },
  };
}

export const actionsComponent: Component<Actions> = new ActionsComponent();
