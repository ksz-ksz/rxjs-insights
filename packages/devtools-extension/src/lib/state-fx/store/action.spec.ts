import { createActions } from './action';

describe('actions', () => {
  it('should create action with correct namespace, name, and payload', () => {
    // given
    const actions = createActions<{ myAction: { prop: string } }>({
      namespace: 'myActions',
    });

    // when
    const action = actions.myAction({ prop: 'asd' });

    // then
    expect(action.name).toBe('myAction');
    expect(action.namespace).toBe('myActions');
    expect(action.payload).toEqual({ prop: 'asd' });
  });
});
