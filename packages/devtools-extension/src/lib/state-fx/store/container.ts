import { Deps, useDeps } from './deps';

export interface Container {
  provide<T>(component: Component<T>, initializer: Component<T>): void;
  use<T>(component: Component<T>): ComponentRef<T>;
}

export interface Component<T> {
  init(container: Container): ComponentInstance<T>;
}

export interface ComponentRef<T> {
  component: T;
  release: () => void;
}

export interface ComponentInstance<T> {
  component: T;
  dispose?: () => void;
}

export function createContainer(): Container {
  const providers = new Map<Component<any>, Component<any>>();
  const components = new Map<Component<any>, ComponentEntry>();

  const container: Container = {
    provide<T>(component: Component<T>, initializer: Component<T>): void {
      providers.set(component, initializer);
    },
    use<T>(component: Component<T>): ComponentRef<T> {
      const entry = getComponentEntry(
        container,
        providers,
        components,
        component
      );
      const { component: comp, refs } = entry;
      const ref: ComponentRef<T> = {
        component: comp,
        release: () => {
          refs.delete(ref);
          if (refs.size === 0) {
            components.delete(component);
            entry.dispose?.();
          }
        },
      };
      refs.add(ref);
      return ref;
    },
  };

  return container;
}

interface ComponentEntry {
  refs: Set<ComponentRef<any>>;
  component: any;
  dispose?: () => void;
}

function getComponentEntry(
  container: Container,
  providers: Map<Component<any>, Component<any>>,
  components: Map<Component<any>, ComponentEntry>,
  component: Component<any>
): ComponentEntry {
  const entry = components.get(component);
  if (entry !== undefined) {
    return entry;
  } else {
    const initializer = providers.get(component) ?? component;
    const instance = initializer.init(container);
    const entry: ComponentEntry = {
      component: instance.component,
      dispose: instance.dispose,
      refs: new Set(),
    };
    components.set(component, entry);
    return entry;
  }
}

export function createComponent<TInstance, TDeps>(
  create: (deps: TDeps) => TInstance,
  options: { deps?: Deps<TDeps>; dispose?: (instance: TInstance) => void } = {}
): Component<TInstance> {
  return {
    init(container: Container): ComponentInstance<TInstance> {
      if (options.deps !== undefined) {
        const { deps, releaseAll } = useDeps(container, options.deps);
        const instance = create(deps);
        return {
          component: instance,
          dispose() {
            releaseAll();
            options?.dispose?.(instance);
          },
        };
      } else {
        const instance = create({} as TDeps);
        return {
          component: instance,
          dispose() {
            options?.dispose?.(instance);
          },
        };
      }
    },
  };
}

export type Components<T> = {
  [K in keyof T]: Component<T[K]>;
};

function useComponentsObject<T extends Record<any, any>>(
  container: Container,
  components: Components<T>
): ComponentRef<T> {
  const refs: ComponentRef<unknown>[] = [];
  const componentsObject: Record<any, any> = {};

  for (const [key, component] of Object.entries<Component<unknown>>(
    components
  )) {
    const ref = container.use(component);
    refs.push(ref);
    componentsObject[key] = ref.component;
  }

  return {
    component: componentsObject as T,
    release() {
      for (const ref of refs) {
        ref.release();
      }
    },
  };
}

function useComponentsArray<T extends Array<any>>(
  container: Container,
  components: [...Components<T>]
): ComponentRef<T> {
  const refs: ComponentRef<unknown>[] = [];
  const componentsArray: Array<any> = [];

  for (const component of components) {
    const ref = container.use(component);
    refs.push(ref);
    componentsArray.push(ref.component);
  }

  return {
    component: componentsArray as T,
    release() {
      for (const ref of refs) {
        ref.release();
      }
    },
  };
}

export function useComponents<T extends Array<any>>(
  container: Container,
  components: [...Components<T>]
): ComponentRef<T>;
export function useComponents<T extends Record<any, any>>(
  container: Container,
  components: Components<T>
): ComponentRef<T>;
export function useComponents(
  container: Container,
  components: Components<Array<any> | Record<any, any>>
): ComponentRef<Array<any> | Record<any, any>> {
  return Array.isArray(components)
    ? useComponentsArray(container, components)
    : useComponentsObject(container, components);
}

export function createComponents<T extends Array<any>>(
  components: [...Components<T>]
): Component<T>;
export function createComponents<T extends Record<any, any>>(
  components: Components<T>
): Component<T>;
export function createComponents(
  components: Components<Array<any> | Record<any, any>>
): Component<Array<any> | Record<any, any>> {
  return {
    init(container) {
      return useComponents(container, components);
    },
  };
}
