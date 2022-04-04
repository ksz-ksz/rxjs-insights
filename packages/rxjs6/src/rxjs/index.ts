import '@rxjs-insights/rxjs-install-module';
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
} from '@rxjs-insights/rxjs-alias-module';
import {
  declareConstructor,
  declareCreator,
  declareSingleton,
} from '@rxjs-insights/core/declarations';

// export const lastValueFrom = ?
// export const firstValueFrom = ?
// export const partition = ?

export const EMPTY = declareSingleton('EMPTY', _EMPTY);
export const NEVER = declareSingleton('NEVER', _NEVER);

export const Observable = declareConstructor('Observable', _Observable);
export const Subject = declareConstructor('Subject', _Subject);
export const AsyncSubject = declareConstructor('AsyncSubject', _AsyncSubject);
export const BehaviorSubject = declareConstructor(
  'BehaviorSubject',
  _BehaviorSubject
);
export const ReplaySubject = declareConstructor(
  'ReplaySubject',
  _ReplaySubject
);

export type AsyncSubject<T> = _AsyncSubject<T>;
export type BehaviorSubject<T> = _BehaviorSubject<T>;
export type Observable<T> = _Observable<T>;
export type ReplaySubject<T> = _ReplaySubject<T>;
export type Subject<T> = _Subject<T>;

export const combineLatest = declareCreator('combineLatest', _combineLatest);
export const concat = declareCreator('concat', _concat);
export const defer = declareCreator('defer', _defer);
export const empty = declareCreator('empty', _empty);
export const forkJoin = declareCreator('forkJoin', _forkJoin);
export const from = declareCreator('from', _from);
export const fromEvent = declareCreator('fromEvent', _fromEvent);
export const fromEventPattern = declareCreator(
  'fromEventPattern',
  _fromEventPattern
);
export const generate = declareCreator('generate', _generate);
export const iif = declareCreator('iif', _iif);
export const interval = declareCreator('interval', _interval);
export const merge = declareCreator('merge', _merge);
export const never = declareCreator('never', _never);
export const of = declareCreator('of', _of);
export const onErrorResumeNext = declareCreator(
  'onErrorResumeNext',
  _onErrorResumeNext
);
export const pairs = declareCreator('pairs', _pairs);
export const race = declareCreator('race', _race);
export const range = declareCreator('range', _range);
export const throwError = declareCreator('throwError', _throwError);
export const timer = declareCreator('timer', _timer);
export const using = declareCreator('using', _using);
export const zip = declareCreator('zip', _zip);
export const scheduled = declareCreator('scheduled', _scheduled);

export * from '@rxjs-insights/rxjs-alias-module';
