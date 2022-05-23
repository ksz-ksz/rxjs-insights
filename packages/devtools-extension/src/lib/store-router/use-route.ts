import { Router } from './router';
import { RouterMetadata } from './router-metadata';
import { useContext } from 'react';
import { getRouterOutletContext } from './router-outlet-context';

export function useRoute<DATA, METADATA extends RouterMetadata>(
  router: Router<any, DATA, METADATA>
) {
  const RouterOutletContext = getRouterOutletContext(router);
  return useContext(RouterOutletContext).currentRoute;
}
