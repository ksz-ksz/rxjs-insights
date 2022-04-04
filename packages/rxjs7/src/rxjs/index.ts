import '@rxjs-insights/rxjs-install-module';
import {
  animationFrames as _animationFrames,
  AsyncSubject as _AsyncSubject,
  audit as _audit,
  auditTime as _auditTime,
  BehaviorSubject as _BehaviorSubject,
  buffer as _buffer,
  bufferCount as _bufferCount,
  bufferTime as _bufferTime,
  bufferToggle as _bufferToggle,
  bufferWhen as _bufferWhen,
  catchError as _catchError,
  combineAll as _combineAll,
  combineLatest as _combineLatest,
  combineLatestAll as _combineLatestAll,
  combineLatestWith as _combineLatestWith,
  concat as _concat,
  concatAll as _concatAll,
  concatMap as _concatMap,
  concatMapTo as _concatMapTo,
  concatWith as _concatWith,
  connect as _connect,
  connectable as _connectable,
  count as _count,
  debounce as _debounce,
  debounceTime as _debounceTime,
  defaultIfEmpty as _defaultIfEmpty,
  defer as _defer,
  delay as _delay,
  delayWhen as _delayWhen,
  dematerialize as _dematerialize,
  distinct as _distinct,
  distinctUntilChanged as _distinctUntilChanged,
  distinctUntilKeyChanged as _distinctUntilKeyChanged,
  elementAt as _elementAt,
  empty as _empty,
  EMPTY as _EMPTY,
  endWith as _endWith,
  every as _every,
  exhaust as _exhaust,
  exhaustAll as _exhaustAll,
  exhaustMap as _exhaustMap,
  expand as _expand,
  filter as _filter,
  finalize as _finalize,
  find as _find,
  findIndex as _findIndex,
  first as _first,
  flatMap as _flatMap,
  forkJoin as _forkJoin,
  from as _from,
  fromEvent as _fromEvent,
  fromEventPattern as _fromEventPattern,
  generate as _generate,
  groupBy as _groupBy,
  ignoreElements as _ignoreElements,
  iif as _iif,
  interval as _interval,
  isEmpty as _isEmpty,
  last as _last,
  map as _map,
  mapTo as _mapTo,
  materialize as _materialize,
  max as _max,
  merge as _merge,
  mergeAll as _mergeAll,
  mergeMap as _mergeMap,
  mergeMapTo as _mergeMapTo,
  mergeScan as _mergeScan,
  mergeWith as _mergeWith,
  min as _min,
  multicast as _multicast,
  never as _never,
  NEVER as _NEVER,
  Observable as _Observable,
  observeOn as _observeOn,
  of as _of,
  onErrorResumeNext as _onErrorResumeNext,
  pairs as _pairs,
  pairwise as _pairwise,
  pluck as _pluck,
  publish as _publish,
  publishBehavior as _publishBehavior,
  publishLast as _publishLast,
  publishReplay as _publishReplay,
  race as _race,
  raceWith as _raceWith,
  range as _range,
  reduce as _reduce,
  refCount as _refCount,
  repeat as _repeat,
  repeatWhen as _repeatWhen,
  ReplaySubject as _ReplaySubject,
  retry as _retry,
  retryWhen as _retryWhen,
  sample as _sample,
  sampleTime as _sampleTime,
  scan as _scan,
  scheduled as _scheduled,
  sequenceEqual as _sequenceEqual,
  share as _share,
  shareReplay as _shareReplay,
  single as _single,
  skip as _skip,
  skipLast as _skipLast,
  skipUntil as _skipUntil,
  skipWhile as _skipWhile,
  startWith as _startWith,
  Subject as _Subject,
  subscribeOn as _subscribeOn,
  switchAll as _switchAll,
  switchMap as _switchMap,
  switchMapTo as _switchMapTo,
  switchScan as _switchScan,
  take as _take,
  takeLast as _takeLast,
  takeUntil as _takeUntil,
  takeWhile as _takeWhile,
  tap as _tap,
  throttle as _throttle,
  throttleTime as _throttleTime,
  throwError as _throwError,
  throwIfEmpty as _throwIfEmpty,
  timeInterval as _timeInterval,
  timeout as _timeout,
  timeoutWith as _timeoutWith,
  timer as _timer,
  timestamp as _timestamp,
  toArray as _toArray,
  using as _using,
  window as _window,
  windowCount as _windowCount,
  windowTime as _windowTime,
  windowToggle as _windowToggle,
  windowWhen as _windowWhen,
  withLatestFrom as _withLatestFrom,
  zip as _zip,
  zipAll as _zipAll,
  zipWith as _zipWith,
} from '@rxjs-insights/rxjs-alias-module';
import {
  declareConstructor,
  declareCreator,
  declareOperator,
  declareSingleton,
} from '@rxjs-insights/core/declarations';

// export const lastValueFrom = ?
// export const firstValueFrom = ?
// export const partition = ?

export const EMPTY = declareSingleton(_EMPTY, 'EMPTY');
export const NEVER = declareSingleton(_NEVER, 'NEVER');

export const AsyncSubject = declareConstructor(_AsyncSubject, 'AsyncSubject');
export const BehaviorSubject = declareConstructor(
  _BehaviorSubject,
  'BehaviorSubject'
);
export const Observable = declareConstructor(_Observable, 'Observable');
export const ReplaySubject = declareConstructor(
  _ReplaySubject,
  'ReplaySubject'
);
export const Subject = declareConstructor(_Subject, 'Subject');

export type AsyncSubject<T> = _AsyncSubject<T>;
export type BehaviorSubject<T> = _BehaviorSubject<T>;
export type Observable<T> = _Observable<T>;
export type ReplaySubject<T> = _ReplaySubject<T>;
export type Subject<T> = _Subject<T>;

export const animationFrames = declareCreator(
  _animationFrames,
  'animationFrames'
);
export const combineLatest = declareCreator(_combineLatest, 'combineLatest');
export const concat = declareCreator(_concat, 'concat');
export const connectable = declareCreator(_connectable, 'connectable');
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

export const audit = declareOperator(_audit, 'audit');
export const auditTime = declareOperator(_auditTime, 'auditTime');
export const buffer = declareOperator(_buffer, 'buffer');
export const bufferCount = declareOperator(_bufferCount, 'bufferCount');
export const bufferTime = declareOperator(_bufferTime, 'bufferTime');
export const bufferToggle = declareOperator(_bufferToggle, 'bufferToggle');
export const bufferWhen = declareOperator(_bufferWhen, 'bufferWhen');
export const catchError = declareOperator(_catchError, 'catchError');
export const combineAll = declareOperator(_combineAll, 'combineAll');
export const combineLatestAll = declareOperator(
  _combineLatestAll,
  'combineLatestAll'
);
export const combineLatestWith = declareOperator(
  _combineLatestWith,
  'combineLatestWith'
);
export const concatAll = declareOperator(_concatAll, 'concatAll');
export const concatMap = declareOperator(_concatMap, 'concatMap');
export const concatMapTo = declareOperator(_concatMapTo, 'concatMapTo');
export const concatWith = declareOperator(_concatWith, 'concatWith');
export const connect = declareOperator(_connect, 'connect');
export const count = declareOperator(_count, 'count');
export const debounce = declareOperator(_debounce, 'debounce');
export const debounceTime = declareOperator(_debounceTime, 'debounceTime');
export const defaultIfEmpty = declareOperator(
  _defaultIfEmpty,
  'defaultIfEmpty'
);
export const delay = declareOperator(_delay, 'delay');
export const delayWhen = declareOperator(_delayWhen, 'delayWhen');
export const dematerialize = declareOperator(_dematerialize, 'dematerialize');
export const distinct = declareOperator(_distinct, 'distinct');
export const distinctUntilChanged = declareOperator(
  _distinctUntilChanged,
  'distinctUntilChanged'
);
export const distinctUntilKeyChanged = declareOperator(
  _distinctUntilKeyChanged,
  'distinctUntilKeyChanged'
);
export const elementAt = declareOperator(_elementAt, 'elementAt');
export const endWith = declareOperator(_endWith, 'endWith');
export const every = declareOperator(_every, 'every');
export const exhaust = declareOperator(_exhaust, 'exhaust');
export const exhaustAll = declareOperator(_exhaustAll, 'exhaustAll');
export const exhaustMap = declareOperator(_exhaustMap, 'exhaustMap');
export const expand = declareOperator(_expand, 'expand');
export const filter = declareOperator(_filter, 'filter');
export const finalize = declareOperator(_finalize, 'finalize');
export const find = declareOperator(_find, 'find');
export const findIndex = declareOperator(_findIndex, 'findIndex');
export const first = declareOperator(_first, 'first');
export const groupBy = declareOperator(_groupBy, 'groupBy');
export const ignoreElements = declareOperator(
  _ignoreElements,
  'ignoreElements'
);
export const isEmpty = declareOperator(_isEmpty, 'isEmpty');
export const last = declareOperator(_last, 'last');
export const map = declareOperator(_map, 'map');
export const mapTo = declareOperator(_mapTo, 'mapTo');
export const materialize = declareOperator(_materialize, 'materialize');
export const max = declareOperator(_max, 'max');
export const mergeAll = declareOperator(_mergeAll, 'mergeAll');
export const flatMap = declareOperator(_flatMap, 'flatMap');
export const mergeMap = declareOperator(_mergeMap, 'mergeMap');
export const mergeMapTo = declareOperator(_mergeMapTo, 'mergeMapTo');
export const mergeScan = declareOperator(_mergeScan, 'mergeScan');
export const mergeWith = declareOperator(_mergeWith, 'mergeWith');
export const min = declareOperator(_min, 'min');
export const multicast = declareOperator(_multicast, 'multicast');
export const observeOn = declareOperator(_observeOn, 'observeOn');
export const pairwise = declareOperator(_pairwise, 'pairwise');
export const pluck = declareOperator(_pluck, 'pluck');
export const publish = declareOperator(_publish, 'publish');
export const publishBehavior = declareOperator(
  _publishBehavior,
  'publishBehavior'
);
export const publishLast = declareOperator(_publishLast, 'publishLast');
export const publishReplay = declareOperator(_publishReplay, 'publishReplay');
export const raceWith = declareOperator(_raceWith, 'raceWith');
export const reduce = declareOperator(_reduce, 'reduce');
export const repeat = declareOperator(_repeat, 'repeat');
export const repeatWhen = declareOperator(_repeatWhen, 'repeatWhen');
export const retry = declareOperator(_retry, 'retry');
export const retryWhen = declareOperator(_retryWhen, 'retryWhen');
export const refCount = declareOperator(_refCount, 'refCount');
export const sample = declareOperator(_sample, 'sample');
export const sampleTime = declareOperator(_sampleTime, 'sampleTime');
export const scan = declareOperator(_scan, 'scan');
export const sequenceEqual = declareOperator(_sequenceEqual, 'sequenceEqual');
export const share = declareOperator(_share, 'share');
export const shareReplay = declareOperator(_shareReplay, 'shareReplay');
export const single = declareOperator(_single, 'single');
export const skip = declareOperator(_skip, 'skip');
export const skipLast = declareOperator(_skipLast, 'skipLast');
export const skipUntil = declareOperator(_skipUntil, 'skipUntil');
export const skipWhile = declareOperator(_skipWhile, 'skipWhile');
export const startWith = declareOperator(_startWith, 'startWith');
export const subscribeOn = declareOperator(_subscribeOn, 'subscribeOn');
export const switchAll = declareOperator(_switchAll, 'switchAll');
export const switchMap = declareOperator(_switchMap, 'switchMap');
export const switchMapTo = declareOperator(_switchMapTo, 'switchMapTo');
export const switchScan = declareOperator(_switchScan, 'switchScan');
export const take = declareOperator(_take, 'take');
export const takeLast = declareOperator(_takeLast, 'takeLast');
export const takeUntil = declareOperator(_takeUntil, 'takeUntil');
export const takeWhile = declareOperator(_takeWhile, 'takeWhile');
export const tap = declareOperator(_tap, 'tap');
export const throttle = declareOperator(_throttle, 'throttle');
export const throttleTime = declareOperator(_throttleTime, 'throttleTime');
export const throwIfEmpty = declareOperator(_throwIfEmpty, 'throwIfEmpty');
export const timeInterval = declareOperator(_timeInterval, 'timeInterval');
export const timeout = declareOperator(_timeout, 'timeout');
export const timeoutWith = declareOperator(_timeoutWith, 'timeoutWith');
export const timestamp = declareOperator(_timestamp, 'timestamp');
export const toArray = declareOperator(_toArray, 'toArray');
export const window = declareOperator(_window, 'window');
export const windowCount = declareOperator(_windowCount, 'windowCount');
export const windowTime = declareOperator(_windowTime, 'windowTime');
export const windowToggle = declareOperator(_windowToggle, 'windowToggle');
export const windowWhen = declareOperator(_windowWhen, 'windowWhen');
export const withLatestFrom = declareOperator(
  _withLatestFrom,
  'withLatestFrom'
);
export const zipAll = declareOperator(_zipAll, 'zipAll');
export const zipWith = declareOperator(_zipWith, 'zipWith');

export * from '@rxjs-insights/rxjs-alias-module';
