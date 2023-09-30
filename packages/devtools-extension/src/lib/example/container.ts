export interface Container {
  use<T>(component: Component<T>): ComponentRef<T>;
  get<T>(component: Component<T>): T;
  get<T>(component: Component<T>, options: { optional: true }): T | undefined;
  get<T>(component: Component<T>, options?: { optional?: false }): T;
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
