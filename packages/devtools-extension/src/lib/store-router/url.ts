export interface Url {
  path: string[];
  queryParams: Record<string, string>;
  fragment?: string;
}

export function createUrl(
  path: string[] = [],
  {
    queryParams = {},
    fragment,
  }: { queryParams?: Record<string, string>; fragment?: string } = {}
): Url {
  return { path, queryParams, fragment };
}
