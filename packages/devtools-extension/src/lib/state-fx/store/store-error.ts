export class StoreError extends Error {
  readonly name = 'StoreError';

  constructor(
    readonly storeName: string | undefined,
    readonly storeKey: string,
    readonly cause: any
  ) {
    super(`Error in ${storeName ?? 'unknown'}::${storeKey}`);
  }
}
