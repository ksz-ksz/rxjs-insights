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
  constructor,
  creator,
  singleton,
} from '@rxjs-insights/instrumentation';

// export const lastValueFrom = ?
// export const firstValueFrom = ?
// export const partition = ?

export const EMPTY = singleton('EMPTY', _EMPTY);
export const NEVER = singleton('NEVER', _NEVER);

export const Observable = constructor('Observable', _Observable);
export const Subject = constructor('Subject', _Subject);
export const AsyncSubject = constructor('AsyncSubject', _AsyncSubject);
export const BehaviorSubject = constructor('BehaviorSubject', _BehaviorSubject);
export const ReplaySubject = constructor('ReplaySubject', _ReplaySubject);

export type AsyncSubject<T> = _AsyncSubject<T>;
export type BehaviorSubject<T> = _BehaviorSubject<T>;
export type Observable<T> = _Observable<T>;
export type ReplaySubject<T> = _ReplaySubject<T>;
export type Subject<T> = _Subject<T>;

export const combineLatest = creator('combineLatest', _combineLatest);
export const concat = creator('concat', _concat);
export const defer = creator('defer', _defer);
export const empty = creator('empty', _empty);
export const forkJoin = creator('forkJoin', _forkJoin);
export const from = creator('from', _from);
export const fromEvent = creator('fromEvent', _fromEvent);
export const fromEventPattern = creator('fromEventPattern', _fromEventPattern);
export const generate = creator('generate', _generate);
export const iif = creator('iif', _iif);
export const interval = creator('interval', _interval);
export const merge = creator('merge', _merge);
export const never = creator('never', _never);
export const of = creator('of', _of);
export const onErrorResumeNext = creator(
  'onErrorResumeNext',
  _onErrorResumeNext
);
export const pairs = creator('pairs', _pairs);
export const race = creator('race', _race);
export const range = creator('range', _range);
export const throwError = creator('throwError', _throwError);
export const timer = creator('timer', _timer);
export const using = creator('using', _using);
export const zip = creator('zip', _zip);
export const scheduled = creator('scheduled', _scheduled);

export * from '@rxjs-insights/rxjs-alias-module';
