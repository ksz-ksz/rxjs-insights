let nextRouterTokenId = 0;

export interface RouteToken {
  id: number;
  name: string;
}

export function createRouteToken(name: string): RouteToken {
  return {
    id: nextRouterTokenId++,
    name,
  };
}
