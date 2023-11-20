import {
  MutationOptions,
  QueryOptions,
  ResourceActions,
} from './resource-actions';
import { ActionTypes, Component, Store } from '@lib/state-fx/store';

interface QuerySubscriber {
  subscriberKey: string;
  options: QueryOptions;
}

interface QueryStateBase {
  queryKey: string;
  queryArgs: any[];
  queryArgsHash: string;
  subscribers: QuerySubscriber[];
  state: 'active' | 'inactive';
  cleanupTimestamp: number | undefined;
}

interface QueryStateInitial extends QueryStateBase {
  status: 'initial';
  data: undefined;
  error: undefined;
  lastDataTimestamp: undefined;
  lastErrorTimestamp: undefined;
}

interface QueryStateInitialData<T = unknown> extends QueryStateBase {
  status: 'initial-data';
  data: T;
  error: undefined;
  lastDataTimestamp: undefined;
  lastErrorTimestamp: undefined;
}

interface QueryStateQueryData<T = unknown> extends QueryStateBase {
  status: 'query-data';
  data: T;
  error: undefined;
  lastDataTimestamp: number;
  lastErrorTimestamp: undefined;
}

interface QueryStateQueryError extends QueryStateBase {
  status: 'query-error';
  data: undefined;
  error: unknown;
  lastDataTimestamp: undefined;
  lastErrorTimestamp: number;
}

interface QueryStateQueryErrorData<T = unknown> extends QueryStateBase {
  status: 'query-error-data';
  data: T;
  error: unknown;
  lastDataTimestamp: number;
  lastErrorTimestamp: number;
}

export type QueryState<T = unknown> =
  | QueryStateInitial
  | QueryStateInitialData<T>
  | QueryStateQueryData<T>
  | QueryStateQueryError
  | QueryStateQueryErrorData<T>;

interface MutationStateBase {
  mutationKey: string;
  mutatorKey: string;
  options: MutationOptions;
  state: 'active' | 'inactive';
  cleanupTimestamp: number | undefined;
}

interface MutationStateInitial extends MutationStateBase {
  status: 'initial';
  mutationArgs: undefined;
  data: undefined;
  error: undefined;
  lastResultTimestamp: undefined;
}

interface MutationStateMutationData<T> extends MutationStateBase {
  status: 'mutation-data';
  mutationArgs: any[];
  data: T;
  error: undefined;
  lastResultTimestamp: number;
}

interface MutationStateMutationError extends MutationStateBase {
  status: 'mutation-error';
  mutationArgs: any[];
  data: undefined;
  error: unknown;
  lastResultTimestamp: number;
}

export type MutationState<T = unknown> =
  | MutationStateInitial
  | MutationStateMutationData<T>
  | MutationStateMutationError;

export interface ResourceState {
  queries: QueryState[];
  mutations: MutationState[];
}

export function createResourceStore(
  actions: ActionTypes<ResourceActions>
): Component<Store<ResourceState>> {
  return undefined as any;
}
