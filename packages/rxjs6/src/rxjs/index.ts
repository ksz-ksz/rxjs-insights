import '@rxjs-insights/install-module';
import {
  AsyncSubject as _AsyncSubject,
  BehaviorSubject as _BehaviorSubject,
  combineLatest as _combineLatest,
  concat as _concat,
  defer as _defer,
  empty as _empty,
  EMPTY as _EMPTY,
  forkJoin as _forkJoin,
  from as _from,
  fromEvent as _fromEvent,
  fromEventPattern as _fromEventPattern,
  generate as _generate,
  iif as _iif,
  interval as _interval,
  merge as _merge,
  never as _never,
  NEVER as _NEVER,
  Observable as _Observable,
  of as _of,
  onErrorResumeNext as _onErrorResumeNext,
  pairs as _pairs,
  race as _race,
  range as _range,
  ReplaySubject as _ReplaySubject,
  scheduled as _scheduled,
  Subject as _Subject,
  throwError as _throwError,
  timer as _timer,
  using as _using,
  zip as _zip,
} from '@rxjs-insights/rxjs-module';
import {
  declareConstructor,
  declareCreator,
  declareSingleton,
} from '@rxjs-insights/core/declarations';

// export const lastValueFrom = ?
// export const firstValueFrom = ?
// export const partition = ?

export const EMPTY = declareSingleton(_EMPTY, 'EMPTY');
export const NEVER = declareSingleton(_NEVER, 'NEVER');

export const Observable = declareConstructor(_Observable, 'Observable');
export const Subject = declareConstructor(_Subject, 'Subject');
export const AsyncSubject = declareConstructor(_AsyncSubject, 'AsyncSubject');
export const BehaviorSubject = declareConstructor(
  _BehaviorSubject,
  'BehaviorSubject'
);
export const ReplaySubject = declareConstructor(
  _ReplaySubject,
  'ReplaySubject'
);

export type AsyncSubject<T> = _AsyncSubject<T>;
export type BehaviorSubject<T> = _BehaviorSubject<T>;
export type Observable<T> = _Observable<T>;
export type ReplaySubject<T> = _ReplaySubject<T>;
export type Subject<T> = _Subject<T>;

export const combineLatest = declareCreator(_combineLatest, 'combineLatest');
export const concat = declareCreator(_concat, 'concat');
export const defer = declareCreator(_defer, 'defer');
export const empty = declareCreator(_empty, 'empty');
export const forkJoin = declareCreator(_forkJoin, 'forkJoin');
export const from = declareCreator(_from, 'from');
export const fromEvent = declareCreator(_fromEvent, 'fromEvent');
export const fromEventPattern = declareCreator(
  _fromEventPattern,
  'fromEventPattern'
);
export const generate = declareCreator(_generate, 'generate');
export const iif = declareCreator(_iif, 'iif');
export const interval = declareCreator(_interval, 'interval');
export const merge = declareCreator(_merge, 'merge');
export const never = declareCreator(_never, 'never');
export const of = declareCreator(_of, 'of');
export const onErrorResumeNext = declareCreator(
  _onErrorResumeNext,
  'onErrorResumeNext'
);
export const pairs = declareCreator(_pairs, 'pairs');
export const race = declareCreator(_race, 'race');
export const range = declareCreator(_range, 'range');
export const throwError = declareCreator(_throwError, 'throwError');
export const timer = declareCreator(_timer, 'timer');
export const using = declareCreator(_using, 'using');
export const zip = declareCreator(_zip, 'zip');
export const scheduled = declareCreator(_scheduled, 'scheduled');

export * from '@rxjs-insights/rxjs-module';
