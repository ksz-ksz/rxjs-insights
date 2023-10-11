import { RouteConfig } from './route-config';

export interface RouteMatch<TData> {
  path: string[];
  params: Record<string, unknown>;
  routeConfig: RouteConfig<TData>;
}

function match<TData>(
  routeConfig: RouteConfig<TData>,
  path: string[]
): RouteMatch<TData>[] {
  const routePath =
    routeConfig.route.path === '' ? [] : routeConfig.route.path.split('/');
  const params: Record<string, any> = {};
  let consumedPath: string[] = [];
  let remainingPath = path;
  for (const routePathSegment of routePath) {
    if (routePathSegment.startsWith(':')) {
      const paramName = routePathSegment.substring(1);
      const paramMatcher = (routeConfig.route?.params as any)?.[paramName];
      if (paramMatcher === undefined) {
        throw new Error(`no param matcher for "${paramName}"`);
      }
      const result = paramMatcher.match(remainingPath);
      if (result.matched) {
        params[paramName] = result.value;
        consumedPath = [...consumedPath, ...result.path];
        remainingPath = remainingPath.slice(result.path.length);
      } else {
        return [];
      }
    } else {
      const [headPathSegment, ...tailPathSegments] = remainingPath;
      if (headPathSegment === routePathSegment) {
        consumedPath = [...consumedPath, routePathSegment];
        remainingPath = tailPathSegments;
      } else {
        return [];
      }
    }
  }

  if (routeConfig.children !== undefined) {
    for (const childRouting of routeConfig.children) {
      const result = match(childRouting, remainingPath);
      if (result.length !== 0) {
        const match: RouteMatch<TData> = {
          path: consumedPath,
          params,
          routeConfig: routeConfig,
        };

        return [match, ...result];
      }
    }
  }

  if (remainingPath.length === 0) {
    const match: RouteMatch<TData> = {
      path: consumedPath,
      params,
      routeConfig: routeConfig,
    };

    return [match];
  }

  return [];
}

export function matchRoutes<TData>(
  routeConfig: RouteConfig<TData>,
  pathname: string
): RouteMatch<TData>[] {
  return match(routeConfig, pathname === '' ? [] : pathname.split('/'));
}
