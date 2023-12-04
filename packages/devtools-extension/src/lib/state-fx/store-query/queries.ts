import { Fn } from './fn';
import { Observable } from 'rxjs';
import { Result } from './result';
import { Action } from '@lib/state-fx/store';
import { ResourceKeys } from './resource-key';

export interface QueryDef<TQuery extends Fn, TDeps> {
  queryFn(
    args: Parameters<TQuery>,
    deps: TDeps
  ): Observable<ReturnType<TQuery>>;

  dispatch?(
    result: Observable<Result<ReturnType<TQuery>>>,
    args: Parameters<TQuery>,
    deps: TDeps
  ): Observable<Action>;

  // getStaleTime?(
  //   queryState: QueryState<ReturnType<TQuery>>,
  //   deps: TDeps
  // ): number;
  // getCacheTime?(
  //   queryState: QueryState<ReturnType<TQuery>>,
  //   deps: TDeps
  // ): number;
}

export type QueriesDef<TQueries extends { [key: string]: Fn }, TDeps> = {
  [K in keyof TQueries]: QueryDef<TQueries[K], TDeps>;
};

export function queries<TQueries extends { [key: string]: Fn }, TDeps>(
  queryKeys: ResourceKeys<TQueries>,
  queryDefs: QueriesDef<TQueries, TDeps>
): QueriesDef<TQueries, TDeps> {
  return queryDefs;
}
