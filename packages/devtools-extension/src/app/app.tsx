import React from 'react';
import { StoreProvider } from '@lib/store';
import { store, useDispatch, useSelector } from '@app/store';
import { statusActions, statusSelectors } from '@app/store/status';

function Status() {
  const dispatch = useDispatch();
  const status = useSelector(statusSelectors.status);
  switch (status) {
    case 'unknown':
      return <span>Awaiting instrumentation...</span>;
    case 'enabled':
      return <span>Instrumentation enabled!</span>;
    case 'disabled':
      return (
        <div>
          <span>
            Instrumentation disabled. Reload page to activate instrumentation.
          </span>

          <button onClick={() => dispatch(statusActions.EnableAndReload())}>
            Enable and reload
          </button>
        </div>
      );
    default:
      return null;
  }
}

export function App() {
  return (
    <StoreProvider value={store}>
      <Status />
    </StoreProvider>
  );
}
