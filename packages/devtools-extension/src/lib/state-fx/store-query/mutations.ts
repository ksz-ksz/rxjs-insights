import { Fn } from './fn';
import { Observable } from 'rxjs';
import { Result } from './result';
import { Action } from '@lib/state-fx/store';
import { ResourceKeys } from './resource-key';
import { QueriesDef } from './queries';

export interface MutationDef<TMutation extends Fn, TDeps> {
  mutateFn(
    args: Parameters<TMutation>,
    deps: TDeps
  ): Observable<ReturnType<TMutation>>;

  dispatch?(
    result: Observable<Result<ReturnType<TMutation>>>,
    args: Parameters<TMutation>,
    deps: TDeps
  ): Observable<Action>;
}

export type MutationsDef<TMutations extends { [key: string]: Fn }, TDeps> = {
  [K in keyof TMutations]: MutationDef<TMutations[K], TDeps>;
};

export function mutations<TQueries extends { [key: string]: Fn }, TDeps>(
  mutationKeys: ResourceKeys<TQueries>,
  mutationDefs: MutationsDef<TQueries, TDeps>
): MutationsDef<TQueries, TDeps> {
  return mutationDefs;
}
