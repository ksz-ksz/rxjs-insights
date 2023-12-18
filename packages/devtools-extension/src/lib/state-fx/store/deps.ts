import {
  Component,
  ComponentRef,
  Container,
  InitializedComponent,
} from './container';

export type Deps<T> = {
  [K in keyof T]: Component<T[K]>;
};

export function useDeps<TDeps>(
  container: Container,
  depsComponents: Deps<TDeps>
): {
  deps: TDeps;
  depsHandles: ComponentRef<unknown>[];
  releaseAll: () => void;
} {
  const depsHandles: ComponentRef<unknown>[] = [];
  const deps: Record<string, unknown> = {};

  for (const [key, dep] of Object.entries<Component<unknown>>(depsComponents)) {
    const depHandle = container.use(dep);
    deps[key] = depHandle.component;
    depsHandles.push(depHandle);
  }

  return {
    deps: deps as TDeps,
    depsHandles,
    releaseAll() {
      for (const depsHandle of depsHandles) {
        depsHandle.release();
      }
    },
  };
}

export function createDeps<TDeps>(
  depsComponents: Deps<TDeps>
): Component<TDeps> {
  return {
    init(container: Container): InitializedComponent<TDeps> {
      const { deps, depsHandles } = useDeps(container, depsComponents);

      return {
        component: deps,
        dispose() {
          for (const depsHandle of depsHandles) {
            depsHandle.release();
          }
        },
      };
    },
  };
}
