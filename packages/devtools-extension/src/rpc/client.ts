import { Sender } from './message';

export type ClientFunction<T> = T extends (...args: infer P) => infer R
  ? (...args: P) => Promise<R | undefined>
  : never;
export type Client<T> = {
  [P in keyof T]: ClientFunction<T[P]>;
};

export function createClient<T>(sender: Sender): Client<T> {
  return new Proxy({} as any, {
    get(target, func: string) {
      if (!target[func]) {
        target[func] = (...args: any[]) =>
          new Promise((resolve, reject) =>
            sender.sendMessage({ func, args }, (response) => {
              if (response?.failure) {
                reject(response?.failure);
              } else {
                resolve(response?.success);
              }
            })
          );
      }
      return target[func];
    },
  });
}
