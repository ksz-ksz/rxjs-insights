import { ClientAdapter } from './message';

export type ClientFunction<T> = T extends (...args: infer P) => infer R
  ? (...args: P) => Promise<R | undefined>
  : never;
export type Client<T> = {
  [P in keyof T]: ClientFunction<T[P]>;
};

// let nextId = 0;

export function createClient<T>(adapter: ClientAdapter): Client<T> {
  return new Proxy({} as any, {
    get(target, func: string) {
      if (!target[func]) {
        target[func] = async (...args: any[]) => {
          // const id = nextId++;
          // console.time(`${adapter.name}{${id}}`);
          const result = await adapter.send({ func, args });
          // console.timeEnd(`${adapter.name}{${id}}`);
          if (result?.failure) {
            throw result?.failure;
          } else {
            return result?.success;
          }
        };
      }
      return target[func];
    },
  });
}
