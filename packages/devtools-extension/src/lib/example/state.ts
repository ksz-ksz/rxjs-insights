import { Action, ActionFactory } from '../state-fx/store/actions';
import { Observable } from 'rxjs';
import { typeOf } from '@lib/state-fx/store';

export interface Store {
  actions: Observable<Action<any>>;
  getState<TNamespace, TValue>(
    template: StateTemplate<TNamespace, TValue>
  ): State<TNamespace, TValue>;
}

export interface State<TNamespace, TValue> {
  getValue(): TValue;
  getValueObservable(): Observable<TValue>;
}

export interface StateTemplate<TNamespace, TValue> {}

export interface Transition<TValue, TDeps, TActionPayload> {
  actions: ActionFactory<TActionPayload>[];
  transition: (
    value: TValue,
    action: Action<TActionPayload>,
    deps: TDeps
  ) => TValue | void;
}

export type Transitions<TValue, TDeps> = {
  [transition: string]: Transition<TValue, TDeps, any>;
};

export interface CreateStateOptions<TNamespace extends string, TValue, TDeps> {
  namespace: TNamespace;
  initialValue: TValue;
}

export function createState<TNamespace extends string, TValue, TDeps>(
  options: CreateStateOptions<TNamespace, TValue, TDeps>
): (
  transitions: Transitions<TValue, TDeps>
) => StateTemplate<TNamespace, TValue> {
  return undefined as any;
}

export type MapActionFactories<TPayloads> = {
  [K in keyof TPayloads]: ActionFactory<TPayloads[K]>;
};

export type MapActions<TPayloads> = {
  [K in keyof TPayloads]: Action<TPayloads[K]>;
};

export function transition<TValue, TDeps, TActionPayloads extends any[]>(
  actions: MapActionFactories<TActionPayloads>,
  transition: (
    value: TValue,
    action: MapActions<TActionPayloads>[number]
  ) => TValue | void
): Transition<TValue, TDeps, TActionPayloads> {
  return { actions, transition };
}
