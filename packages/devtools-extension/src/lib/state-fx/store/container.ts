export interface Container {
  provide<T>(component: Component<T>, initializer: Component<T>): void;
  use<T>(component: Component<T>): ComponentRef<T>;
}

export interface Component<T> {
  init(container: Container): InitializedComponent<T>;
}

export interface ComponentRef<T> {
  component: T;
  release: () => void;
}

export interface InitializedComponent<T> {
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
