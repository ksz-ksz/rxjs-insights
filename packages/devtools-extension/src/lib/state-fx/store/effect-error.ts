export class EffectError extends Error {
  readonly name = 'EffectError';

  constructor(
    readonly namespace: string,
    readonly key: string,
    readonly cause: any
  ) {
    super(`Error in ${namespace}::${key}`);
  }
}
