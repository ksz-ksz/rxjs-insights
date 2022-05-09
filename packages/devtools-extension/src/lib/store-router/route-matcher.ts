import { RouteConfig } from './routing';
import { Route } from './route';

interface RouteNode<DATA, METADATA> {
  id: number;
  config: RouteConfig<DATA, METADATA>;
  children: RouteNode<DATA, METADATA>[];
}

function getRank(segment: string | undefined) {
  if (segment !== undefined) {
    return segment.startsWith(':') ? 1 : 2;
  } else {
    return 0;
  }
}

function routeNodesComparator(a: RouteNode<any, any>, b: RouteNode<any, any>) {
  const aPath = a.config.path ?? [];
  const bPath = b.config.path ?? [];
  const n = Math.max(aPath.length, bPath.length);
  for (let i = 0; i < n; i++) {
    const aSegment = aPath[i];
    const bSegment = bPath[i];
    const aRank = getRank(aSegment);
    const bRank = getRank(bSegment);
    if (aRank !== bRank) {
      return bRank - aRank;
    }
  }
  return 0;
}

function createRouteNodes<DATA, METADATA>(
  routeNodeIds: Ids,
  configs: RouteConfig<DATA, METADATA>[]
) {
  return configs
    .map(
      (config): RouteNode<DATA, METADATA> => ({
        id: routeNodeIds.next(),
        config,
        children: createRouteNodes(routeNodeIds, config.children ?? []),
      })
    )
    .sort(routeNodesComparator);
}

class Ids {
  private id = 0;

  next() {
    return this.id++;
  }
}

function getLongestCommonPrefixLength(configPath: string[], path: string[]) {
  const n = Math.min(configPath.length, path.length);
  for (let i = 0; i < n; i++) {
    if (!configPath[i].startsWith(':') && configPath[i] !== path[i]) {
      return i;
    }
  }
  return n;
}

function createRoute<DATA, METADATA>(
  routeNode: RouteNode<DATA, METADATA>,
  path: string[]
): Route<DATA> {
  return {
    routeConfigId: routeNode.id,
    data: routeNode.config.data,
    params: getParams(routeNode.config.path, path),
  };
}

function matchRouteNodes<DATA, METADATA>(
  path: string[],
  routeNodes: RouteNode<DATA, METADATA>[]
): Route<DATA>[] {
  if (path.length === 0) {
    for (const routeNode of routeNodes) {
      if (routeNode.config.path.length === 0) {
        if (routeNode.children.length === 0) {
          return [createRoute(routeNode, path)];
        } else {
          const childRoutes = matchRouteNodes(path, routeNode.children);
          if (childRoutes.length !== 0) {
            return [createRoute(routeNode, path), ...childRoutes];
          }
        }
      }
    }
  } else {
    for (let segment of path) {
      for (const routeNode of routeNodes) {
        const longestCommonPrefixLength = getLongestCommonPrefixLength(
          routeNode.config.path,
          path
        );
        if (longestCommonPrefixLength === routeNode.config.path.length) {
          if (routeNode.children.length === 0) {
            if (longestCommonPrefixLength === path.length) {
              return [createRoute(routeNode, path)];
            }
          } else {
            const childRoutes = matchRouteNodes(
              path.slice(longestCommonPrefixLength),
              routeNode.children
            );
            if (childRoutes.length !== 0) {
              return [createRoute(routeNode, path), ...childRoutes];
            }
          }
        }
      }
    }
  }
  return [];
}

function getParams(configPath: string[], path: string[]) {
  const params: Record<string, string> = {};
  const n = Math.min(configPath.length, path.length);
  for (let i = 0; i < n; i++) {
    const configSegment = configPath[i];
    if (configSegment.startsWith(':')) {
      params[configSegment.substring(1)] = path[i];
    }
  }
  return params;
}

export class RouteMatcher<DATA, METADATA> {
  private readonly routeNodes: RouteNode<DATA, METADATA>[];
  private routeNodesById: Record<number, RouteNode<DATA, METADATA> | undefined>;

  constructor(configs: RouteConfig<DATA, METADATA>[]) {
    this.routeNodes = createRouteNodes(new Ids(), configs);
    this.routeNodesById = Object.fromEntries(
      this.routeNodes.map((routeNode) => [routeNode.id, routeNode])
    );
  }

  match(path: string[]): Route<DATA>[] {
    return matchRouteNodes(path, this.routeNodes);
  }

  getRouteConfig(id: number): RouteConfig<DATA, METADATA> | undefined {
    return this.routeNodesById[id]?.config;
  }
}
