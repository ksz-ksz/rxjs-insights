import { Fn } from './fn';
import {
  catchError,
  connect,
  delay,
  EMPTY,
  exhaustMap,
  filter,
  groupBy,
  last,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
import { Result } from './result';
import {
  Action,
  createDeps,
  createEffect,
  Deps,
  StoreComponent,
} from '../store';
import { ResourceActionTypes } from './resource-actions';
import { getCacheTimestamp, QueryState, ResourceState } from './resource-store';
import { schedulerComponent } from './scheduler';
import { getQuery } from './get-query';
import { is } from '../store/is';
import { getQueryHash } from './get-query-hash';
import { QueriesDef, QueryDef } from './queries';
import { createQueryActionsEmitter } from './query-actions-emitter';
import { createQueryEffect } from './query-effect';

interface MutationDef<TMutation extends Fn, TDeps> {
  mutate(
    args: Parameters<TMutation>,
    deps: TDeps
  ): Observable<ReturnType<TMutation>>;

  dispatch?(
    result: Observable<Result<ReturnType<TMutation>>>,
    args: Parameters<TMutation>,
    deps: TDeps
  ): Observable<Action>;
}

type MutationsDef<TMutations extends { [key: string]: Fn }, TDeps> = {
  [K in keyof TMutations]: MutationDef<TMutations[K], TDeps>;
};

export function createResourceEffect<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn },
  TDeps
>(
  options: {
    namespace: string;
    store: StoreComponent<ResourceState>;
    actions: ResourceActionTypes;
    deps?: Deps<TDeps>;
  },
  defs: {
    queries?: QueriesDef<TQueries, TDeps>;
    mutations?: MutationsDef<TMutations, TDeps>;
  }
) {
  const { queries } = defs;
  const {
    namespace,
    deps = {} as Deps<TDeps>,
    actions: resourceActions,
    store: resourceStore,
  } = options;

  return createDeps({
    queryActionsEmitter: createQueryActionsEmitter(
      namespace,
      resourceActions,
      resourceStore
    ),
    queryEffect: createQueryEffect(
      namespace,
      queries ?? {},
      resourceActions,
      deps
    ),
  });
}
