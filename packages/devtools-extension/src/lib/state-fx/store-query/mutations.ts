import { Fn } from './fn';
import { Observable } from 'rxjs';
import { Result } from './result';
import { Action } from '@lib/state-fx/store';
import { ResourceKeys } from './resource-key';
import { QueriesDef } from './queries';

export interface MutationDef<TMutation extends Fn> {
  mutateFn(args: Parameters<TMutation>): Observable<ReturnType<TMutation>>;

  dispatch?(
    result: Observable<Result<ReturnType<TMutation>>>,
    args: Parameters<TMutation>
  ): Observable<Action>;
}

export type MutationsDef<TMutations extends { [key: string]: Fn }> = {
  [K in keyof TMutations]: MutationDef<TMutations[K]>;
};
