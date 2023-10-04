import React, { useEffect } from 'react';
import { Component, ComponentRef } from '@lib/state-fx/store';
import { useContainer } from './use-container';

export function useComponent<T>(component: Component<T>): T {
  const container = useContainer();
  const refRef = React.useRef<ComponentRef<any> | null>(null);
  if (refRef.current === null) {
    refRef.current = container.use(component);
  }

  useEffect(() => {
    const ref = refRef.current!;

    return () => {
      ref.release();
    };
  }, []);

  return refRef.current!.component;
}
