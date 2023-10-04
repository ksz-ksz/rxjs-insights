import { useContext } from 'react';
import { ContainerContext } from './container-context';

export function useContainer() {
  return useContext(ContainerContext);
}
