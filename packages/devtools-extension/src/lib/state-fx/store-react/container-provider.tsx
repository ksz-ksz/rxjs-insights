import React, { useEffect } from 'react';
import {
  Component,
  ComponentRef,
  Container,
  createContainer,
  Store,
} from '@lib/state-fx/store';
import { ContainerContext } from './container-context';

export interface ContainerProviderProps {
  components: Component<any>[];
}

export function ContainerProvider({
  components,
  children,
}: React.PropsWithChildren<ContainerProviderProps>) {
  const containerRef = React.useRef<Container | null>(null);
  const refsRef = React.useRef<ComponentRef<any>[] | null>(null);

  if (containerRef.current === null) {
    const container = createContainer();
    const refs = components.map((component) => container.use(component));
    containerRef.current = container;
    refsRef.current = refs;
  }

  useEffect(() => {
    const refs = refsRef.current!;

    return () => {
      refs.forEach((ref) => ref.release());
    };
  }, []);

  return (
    <ContainerContext.Provider value={containerRef.current}>
      {children}
    </ContainerContext.Provider>
  );
}
