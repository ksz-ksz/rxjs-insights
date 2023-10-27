import { createStore, tx } from './store';
import { createActions } from './action';
import { createStoreSuperSelector } from './super-selector';
import { createSelection } from './selection';
import { createContainer } from './container';
import { actionsComponent } from './actions';

const testActions = createActions<{ update: string }>({
  namespace: 'test',
});

const testStore = createStore({
  namespace: 'test',
  state: 'initial',
})({
  update: tx([testActions.update], (state, action) => {
    return action.payload;
  }),
});

const selectTestState = createStoreSuperSelector(testStore);

const testStateSelection = createSelection(selectTestState);

describe('Selection', () => {
  it('should work', () => {
    const container = createContainer();

    const actions = container.use(actionsComponent).component;
    const testState = container.use(testStateSelection).component;

    expect(testState.getResult()).toEqual('initial');

    actions.dispatch(testActions.update('updated'));

    expect(testState.getResult()).toEqual('updated');
  });

  it('should work', () => {
    const container = createContainer();

    const actions = container.use(actionsComponent).component;
    const testState = container.use(testStateSelection).component;

    const listing: any[] = [];
    testState.subscribe({
      next(value) {
        listing.push(value);
      },
    });

    actions.dispatch(testActions.update('updated'));

    expect(listing).toEqual([undefined, undefined]);
  });
});
