import { Component, ComponentRef, Container } from '@lib/state-fx/store';

export class ComponentsResolver<T> {
  private readonly map = new Map<Component<T>, ComponentRef<T>>();
  constructor(private readonly container: Container) {}

  resolve(component: Component<T>): T {
    let ruleRef = this.map.get(component);
    if (ruleRef === undefined) {
      ruleRef = this.container.use(component);
      this.map.set(component, ruleRef);
    }
    return ruleRef.component;
  }

  dispose(): void {
    this.map.forEach((ruleRef) => ruleRef.release());
  }
}
