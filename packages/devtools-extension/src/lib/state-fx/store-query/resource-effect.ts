import { Fn } from './fn';
import { Observable } from 'rxjs';
import { Result } from './result';
import { Action, ActionTypes, Deps } from '@lib/state-fx/store';
import { CreateResourceKeysResult } from './resource-key';
import { ResourceActions } from './resource-actions';

interface QueryDef<TQuery extends Fn, TDeps> {
  query(args: Parameters<TQuery>, deps: TDeps): Observable<ReturnType<TQuery>>;

  dispatch?(
    result: Observable<Result<ReturnType<TQuery>>>,
    args: Parameters<TQuery>,
    deps: TDeps
  ): Observable<Action>;
}

type QueriesDef<TQueries extends { [key: string]: Fn }, TDeps> = {
  [K in keyof TQueries]: QueryDef<TQueries[K], TDeps>;
};

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
    keys: CreateResourceKeysResult<TQueries, TMutations>;
    actions: ActionTypes<ResourceActions>;
    deps?: Deps<TDeps>;
  },
  queries: QueriesDef<TQueries, TDeps>,
  mutations: MutationsDef<TMutations, TDeps>
) {
  return undefined as any;
}
