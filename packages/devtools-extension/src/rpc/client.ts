import { ClientAdapter } from './message';

export type ClientFunction<T> = T extends (...args: infer P) => infer R
  ? (...args: P) => Promise<R | undefined>
  : never;
export type Client<T> = {
  [P in keyof T]: ClientFunction<T[P]>;
};

export function createClient<T>(sender: ClientAdapter): Client<T> {
  return new Proxy({} as any, {
    get(target, func: string) {
      if (!target[func]) {
        target[func] = async (...args: any[]) => {
          const result = await sender.send({ func, args });
          if (result?.failure) {
            throw result.failure;
          } else {
            return result.success;
          }
        };
      }
      return target[func];
    },
  });
}
