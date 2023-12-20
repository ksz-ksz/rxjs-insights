import { Fn } from './fn';
import { Observable } from 'rxjs';
import { Result } from './result';
import { Action } from '@lib/state-fx/store';
import { ResourceKeys } from './resource-key';

export interface QueryDef<TQuery extends Fn> {
  queryFn(args: Parameters<TQuery>): Observable<ReturnType<TQuery>>;

  dispatch?(
    result: Observable<Result<ReturnType<TQuery>>>,
    args: Parameters<TQuery>
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

export type QueriesDef<TQueries extends { [key: string]: Fn }> = {
  [K in keyof TQueries]: QueryDef<TQueries[K]>;
};
