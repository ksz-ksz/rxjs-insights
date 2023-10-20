export interface RouteObject<
  TParams = unknown,
  TSearch = unknown,
  THash = unknown
> {
  id: number;
  path: string[];
  params: TParams;
  search: TSearch; // TODO: might be undefined; see routing.ts/matchRoutes
  hash: THash; // TODO: might be undefined; see routing.ts/matchRoutes
}
