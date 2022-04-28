import React from 'react';
import { StoreProvider } from '@lib/store';
import { store, useDispatch, useSelector } from '@app/store';
import { statusActions, statusSelectors } from '@app/store/status';

function Status() {
  const dispatch = useDispatch();
  const status = useSelector(statusSelectors.instrumentationStatus);
  switch (status) {
    case undefined:
      return <span>Awaiting instrumentation...</span>;
    case 'not-installed':
      return (
        <div>
          <span>
            Instrumentation is not installed. Reload the page to install the
            instrumentation.
          </span>

          <button
            onClick={() => dispatch(statusActions.InstallInstrumentation())}
          >
            Reload page
          </button>
        </div>
      );
    case 'not-available':
      return (
        <div>
          <span>
            Instrumentation is not available. Make sure that you set up the
            instrumentation properly.
            <a
              target="_blank"
              href="https://github.com/ksz-ksz/rxjs-insights/blob/master/docs/instrumentation/index.md"
            >
              Refer to the documentation to learn more.
            </a>
          </span>
        </div>
      );
    default:
      return <span>Instrumentation enabled!</span>;
  }
}

export function App() {
  return (
    <StoreProvider value={store}>
      <Status />
    </StoreProvider>
  );
}
