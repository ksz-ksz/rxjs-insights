export interface RouteObject<
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  id: number;
  path: string[];
  params: TParams;
  search: TSearch;
  hash: THash;
}
