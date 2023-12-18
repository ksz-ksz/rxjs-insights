import {
  Component,
  Container,
  createContainer,
  ComponentInstance,
} from './container';

class FakeComponent implements Component<number> {
  private id = 0;
  public status: 'initialized' | 'disposed' | undefined;

  init(container: Container): ComponentInstance<number> {
    this.status = 'initialized';
    const id = this.id++;
    return {
      component: id,
      dispose: () => {
        this.status = 'disposed';
      },
    };
  }
}

describe('Container', () => {
  describe('use', () => {
    describe('when component does not exist', () => {
      it('should create component', () => {
        const container = createContainer();
        const component = new FakeComponent();

        const ref = container.use(component);

        expect(ref.component).toBe(0);
      });
    });
    describe('when component existed, but was released', () => {
      it('should create component', () => {
        const container = createContainer();
        const component = new FakeComponent();
        container.use(component).release();

        const ref = container.use(component);

        expect(ref.component).toBe(1);
      });
    });
    describe('when component exists', () => {
      it('should not create component', () => {
        const container = createContainer();
        const component = new FakeComponent();
        container.use(component);

        const ref = container.use(component);

        expect(ref.component).toBe(0);
      });
    });
  });
  describe('release', () => {
    describe('when is last component ref', () => {
      it('should dispose component', () => {
        const container = createContainer();
        const component = new FakeComponent();
        const ref1 = container.use(component);
        const ref2 = container.use(component);

        ref1.release();
        ref2.release();

        expect(component.status).toBe('disposed');
      });
    });
    describe('when is not last component ref', () => {
      it('should not dispose component', () => {
        const container = createContainer();
        const component = new FakeComponent();
        const ref1 = container.use(component);
        container.use(component);

        ref1.release();

        expect(component.status).toBe('initialized');
      });
    });
  });
});
