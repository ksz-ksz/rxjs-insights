export interface ActiveRoute<TParams, TSearch, THash> {
  id: number;
  // parent: ActiveRoute<any, any, any> | undefined; // TODO: how would that work in store? (it's not normalized)
  path: string[];
  params: TParams;
  search: TSearch;
  hash: THash;
}
