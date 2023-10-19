import { RouteConfig } from './route-config';

export interface RouteMatch<TData, TSearchInput, THashInput> {
  path: string[];
  params: Record<string, unknown>;
  routeConfig: RouteConfig<TData, TSearchInput, THashInput>;
}

function match<TData, TSearchInput, THashInput>(
  routeConfig: RouteConfig<TData, TSearchInput, THashInput>,
  path: string[]
): RouteMatch<TData, TSearchInput, THashInput>[] {
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
        const match: RouteMatch<TData, TSearchInput, THashInput> = {
          path: consumedPath,
          params,
          routeConfig: routeConfig,
        };

        return [match, ...result];
      }
    }
  }

  if (remainingPath.length === 0) {
    const match: RouteMatch<TData, TSearchInput, THashInput> = {
      path: consumedPath,
      params,
      routeConfig: routeConfig,
    };

    return [match];
  }

  return [];
}

export function matchRoutes<TData, TSearchInput, THashInput>(
  routeConfig: RouteConfig<TData, TSearchInput, THashInput>,
  pathname: string
): RouteMatch<TData, TSearchInput, THashInput>[] {
  return match(routeConfig, pathname === '' ? [] : pathname.split('/'));
}
