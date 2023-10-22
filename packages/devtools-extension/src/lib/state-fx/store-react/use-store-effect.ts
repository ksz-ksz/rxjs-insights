import { Component, Effect } from '@lib/state-fx/store';
import { useContainer } from './use-container';
import { useEffect } from 'react';

export function useStoreEffect(effect: Component<Effect>, deps: any[]): void {
  const container = useContainer();
  useEffect(() => {
    const effectRef = container.use(effect);

    return effectRef.release;
  }, deps);
}
