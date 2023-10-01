export interface Container {
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
  const components = new Map<Component<any>, ComponentEntry>();

  const container: Container = {
    use<T>(component: Component<T>): ComponentRef<T> {
      const entry = getComponentEntry(container, components, component);
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
  components: Map<Component<any>, ComponentEntry>,
  component: Component<any>
): ComponentEntry {
  const entry = components.get(component);
  if (entry !== undefined) {
    return entry;
  } else {
    const instance = component.init(container);
    const entry: ComponentEntry = {
      component: instance.component,
      dispose: instance.dispose,
      refs: new Set(),
    };
    components.set(component, entry);
    return entry;
  }
}
