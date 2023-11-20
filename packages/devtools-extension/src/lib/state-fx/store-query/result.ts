interface SuccessResult<T = unknown> {
  status: 'success';
  data: T;
}

interface FailureResult {
  status: 'failure';
  error: unknown;
}

export type Result<T = unknown> = SuccessResult<T> | FailureResult;
