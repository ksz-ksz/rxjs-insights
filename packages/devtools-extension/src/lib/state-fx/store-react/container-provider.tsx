import React, { useEffect } from 'react';
import {
  Component,
  ComponentRef,
  Container,
  createContainer,
} from '@lib/state-fx/store';
import { ContainerContext } from './container-context';

export interface ComponentProvider<T> {
  component: Component<T>;
  initializer: Component<T>;
}

export interface ContainerProviderProps {
  providers: ComponentProvider<any>[];
  components: Component<any>[];
}

export function provide<T>(
  component: Component<T>,
  initializer: Component<T>
): ComponentProvider<T> {
  return { component, initializer };
}

export function ContainerProvider({
  providers,
  components,
  children,
}: React.PropsWithChildren<ContainerProviderProps>) {
  const containerRef = React.useRef<Container | null>(null);
  const refsRef = React.useRef<ComponentRef<any>[] | null>(null);

  if (containerRef.current === null) {
    const container = createContainer();
    providers.forEach(({ component, initializer }) =>
      container.provide(component, initializer)
    );
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
