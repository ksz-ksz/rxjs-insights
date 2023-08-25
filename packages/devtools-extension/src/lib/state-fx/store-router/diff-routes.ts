import { ActiveRoute } from './active-route';

export function diffRoutes(
  prevRoutes: ActiveRoute<any, any, any>[],
  nextRoutes: ActiveRoute<any, any, any>[]
) {
  if (prevRoutes.length === 0) {
    return {
      updatedRoutes: [],
      activatedRoutes: nextRoutes,
      deactivatedRoutes: [],
    };
  }

  if (nextRoutes.length === 0) {
    return {
      updatedRoutes: [],
      activatedRoutes: [],
      deactivatedRoutes: prevRoutes,
    };
  }

  const n = Math.min(prevRoutes.length, nextRoutes.length);
  const updatedRoutes: [
    ActiveRoute<any, any, any>,
    ActiveRoute<any, any, any>
  ][] = [];
  for (let i = 0; i < n; i++) {
    const prevRoute = prevRoutes[i];
    const nextRoute = nextRoutes[i];

    if (prevRoute.id === nextRoute.id) {
      updatedRoutes.push([prevRoute, nextRoute]);
    } else {
      return {
        updatedRoutes,
        activatedRoutes: nextRoutes.slice(i),
        deactivatedRoutes: prevRoutes.slice(i),
      };
    }
  }
  return {
    updatedRoutes,
    activatedRoutes: nextRoutes.slice(n),
    deactivatedRoutes: prevRoutes.slice(n),
  };
}