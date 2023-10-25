import { useEffect, useRef } from 'react';
import { Component, ComponentRef } from '@lib/state-fx/store';
import { useContainer } from './use-container';

export function useComponent<T>(component: Component<T>): T {
  const container = useContainer();
  const componentDataRef = useRef<[Component<T>, ComponentRef<T>] | null>(null);
  if (componentDataRef.current !== null) {
    const [prevComponent, prevComponentRef] = componentDataRef.current;
    if (prevComponent !== component) {
      prevComponentRef.release();
      componentDataRef.current = [component, container.use(component)];
    }
  } else {
    componentDataRef.current = [component, container.use(component)];
  }

  useEffect(() => {
    if (componentDataRef.current !== null) {
      const [, prevComponentRef] = componentDataRef.current;
      prevComponentRef.release();
    }
  }, []);

  const [, componentRef] = componentDataRef.current;
  return componentRef.component;
}
