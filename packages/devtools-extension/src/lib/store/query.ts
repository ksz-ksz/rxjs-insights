import { HasSlice } from './slice';

export interface Query<INPUT, OUTPUT> {
  select(input: INPUT): OUTPUT;
}

export function createQuery<INPUT, OUTPUT>(
  select: (input: INPUT) => OUTPUT
): Query<INPUT, OUTPUT>;
export function createQuery<DOMAIN_NAME extends string, DOMAIN_STATE, OUTPUT>(
  select: (input: DOMAIN_STATE) => OUTPUT,
  domainName: DOMAIN_NAME
): Query<HasSlice<DOMAIN_NAME, DOMAIN_STATE>, OUTPUT>;
export function createQuery<INPUT, OUTPUT>(
  select: (input: INPUT) => OUTPUT,
  domainName?: string
) {
  return domainName
    ? { select: (domainState: any) => select(domainState[domainName]) }
    : { select };
}
