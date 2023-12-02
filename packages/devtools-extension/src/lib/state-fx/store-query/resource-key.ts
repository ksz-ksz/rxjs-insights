import { Fn } from './fn';

export type ResourceKey<TFn extends Fn = Fn> = string & {
  _fn?: void & TFn;
};

export type ResourceKeys<TFns extends { [key: string]: Fn }> = {
  [K in keyof TFns]: ResourceKey<TFns[K]>;
};

export interface CreateResourceKeysResult<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn }
> {
  query: ResourceKeys<TQueries>;
  mutation: ResourceKeys<TMutations>;
}

function createResourceKeysProxy() {
  return new Proxy(
    {},
    {
      get(target: ResourceKeys<any>, property: string): ResourceKey {
        return property;
      },
    }
  );
}

export function createResourceKeys<
  TQueries extends { [key: string]: Fn },
  TMutations extends { [key: string]: Fn }
>(): CreateResourceKeysResult<TQueries, TMutations> {
  return {
    query: createResourceKeysProxy(),
    mutation: createResourceKeysProxy(),
  };
}
