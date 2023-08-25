import { Routing } from './routing';

export interface RouteMatch {
  path: string[];
  params: Record<string, unknown>;
  routing: Routing<any, any, any, any, any>;
}

function match(
  routing: Routing<any, any, any, any, any>,
  path: string[]
): RouteMatch[] {
  const routePath =
    routing.route.path === '' ? [] : routing.route.path.split('/');
  const params: Record<string, any> = {};
  let consumedPath: string[] = [];
  let remainingPath = path;
  for (const routePathSegment of routePath) {
    if (routePathSegment.startsWith(':')) {
      const paramName = routePathSegment.substring(1);
      const paramMatcher = routing.route?.params?.[paramName];
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

  if (routing.children !== undefined) {
    for (const childRouting of routing.children) {
      const result = match(childRouting, remainingPath);
      if (result.length !== 0) {
        const match: RouteMatch = {
          path: consumedPath,
          params,
          routing,
        };

        return [match, ...result];
      }
    }
  }

  if (remainingPath.length === 0) {
    const match: RouteMatch = {
      path: consumedPath,
      params,
      routing,
    };

    return [match];
  }

  return [];
}

export function matchRoutes(
  routing: Routing<any, any, any, any, any>,
  pathname: string
): RouteMatch[] {
  return match(routing, pathname.split('/'));
}
