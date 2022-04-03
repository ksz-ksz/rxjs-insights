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
} from '@rxjs-insights/instrumentation/declarations';

// export const lastValueFrom = ?
// export const firstValueFrom = ?
// export const partition = ?

export const EMPTY = declareSingleton('EMPTY', _EMPTY);
export const NEVER = declareSingleton('NEVER', _NEVER);

export const AsyncSubject = declareConstructor('AsyncSubject', _AsyncSubject);
export const BehaviorSubject = declareConstructor(
  'BehaviorSubject',
  _BehaviorSubject
);
export const Observable = declareConstructor('Observable', _Observable);
export const ReplaySubject = declareConstructor(
  'ReplaySubject',
  _ReplaySubject
);
export const Subject = declareConstructor('Subject', _Subject);

export type AsyncSubject<T> = _AsyncSubject<T>;
export type BehaviorSubject<T> = _BehaviorSubject<T>;
export type Observable<T> = _Observable<T>;
export type ReplaySubject<T> = _ReplaySubject<T>;
export type Subject<T> = _Subject<T>;

export const animationFrames = declareCreator(
  'animationFrames',
  _animationFrames
);
export const combineLatest = declareCreator('combineLatest', _combineLatest);
export const concat = declareCreator('concat', _concat);
export const connectable = declareCreator('connectable', _connectable);
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

export const audit = declareOperator('audit', _audit);
export const auditTime = declareOperator('auditTime', _auditTime);
export const buffer = declareOperator('buffer', _buffer);
export const bufferCount = declareOperator('bufferCount', _bufferCount);
export const bufferTime = declareOperator('bufferTime', _bufferTime);
export const bufferToggle = declareOperator('bufferToggle', _bufferToggle);
export const bufferWhen = declareOperator('bufferWhen', _bufferWhen);
export const catchError = declareOperator('catchError', _catchError);
export const combineAll = declareOperator('combineAll', _combineAll);
export const combineLatestAll = declareOperator(
  'combineLatestAll',
  _combineLatestAll
);
export const combineLatestWith = declareOperator(
  'combineLatestWith',
  _combineLatestWith
);
export const concatAll = declareOperator('concatAll', _concatAll);
export const concatMap = declareOperator('concatMap', _concatMap);
export const concatMapTo = declareOperator('concatMapTo', _concatMapTo);
export const concatWith = declareOperator('concatWith', _concatWith);
export const connect = declareOperator('connect', _connect);
export const count = declareOperator('count', _count);
export const debounce = declareOperator('debounce', _debounce);
export const debounceTime = declareOperator('debounceTime', _debounceTime);
export const defaultIfEmpty = declareOperator(
  'defaultIfEmpty',
  _defaultIfEmpty
);
export const delay = declareOperator('delay', _delay);
export const delayWhen = declareOperator('delayWhen', _delayWhen);
export const dematerialize = declareOperator('dematerialize', _dematerialize);
export const distinct = declareOperator('distinct', _distinct);
export const distinctUntilChanged = declareOperator(
  'distinctUntilChanged',
  _distinctUntilChanged
);
export const distinctUntilKeyChanged = declareOperator(
  'distinctUntilKeyChanged',
  _distinctUntilKeyChanged
);
export const elementAt = declareOperator('elementAt', _elementAt);
export const endWith = declareOperator('endWith', _endWith);
export const every = declareOperator('every', _every);
export const exhaust = declareOperator('exhaust', _exhaust);
export const exhaustAll = declareOperator('exhaustAll', _exhaustAll);
export const exhaustMap = declareOperator('exhaustMap', _exhaustMap);
export const expand = declareOperator('expand', _expand);
export const filter = declareOperator('filter', _filter);
export const finalize = declareOperator('finalize', _finalize);
export const find = declareOperator('find', _find);
export const findIndex = declareOperator('findIndex', _findIndex);
export const first = declareOperator('first', _first);
export const groupBy = declareOperator('groupBy', _groupBy);
export const ignoreElements = declareOperator(
  'ignoreElements',
  _ignoreElements
);
export const isEmpty = declareOperator('isEmpty', _isEmpty);
export const last = declareOperator('last', _last);
export const map = declareOperator('map', _map);
export const mapTo = declareOperator('mapTo', _mapTo);
export const materialize = declareOperator('materialize', _materialize);
export const max = declareOperator('max', _max);
export const mergeAll = declareOperator('mergeAll', _mergeAll);
export const flatMap = declareOperator('flatMap', _flatMap);
export const mergeMap = declareOperator('mergeMap', _mergeMap);
export const mergeMapTo = declareOperator('mergeMapTo', _mergeMapTo);
export const mergeScan = declareOperator('mergeScan', _mergeScan);
export const mergeWith = declareOperator('mergeWith', _mergeWith);
export const min = declareOperator('min', _min);
export const multicast = declareOperator('multicast', _multicast);
export const observeOn = declareOperator('observeOn', _observeOn);
export const pairwise = declareOperator('pairwise', _pairwise);
export const pluck = declareOperator('pluck', _pluck);
export const publish = declareOperator('publish', _publish);
export const publishBehavior = declareOperator(
  'publishBehavior',
  _publishBehavior
);
export const publishLast = declareOperator('publishLast', _publishLast);
export const publishReplay = declareOperator('publishReplay', _publishReplay);
export const raceWith = declareOperator('raceWith', _raceWith);
export const reduce = declareOperator('reduce', _reduce);
export const repeat = declareOperator('repeat', _repeat);
export const repeatWhen = declareOperator('repeatWhen', _repeatWhen);
export const retry = declareOperator('retry', _retry);
export const retryWhen = declareOperator('retryWhen', _retryWhen);
export const refCount = declareOperator('refCount', _refCount);
export const sample = declareOperator('sample', _sample);
export const sampleTime = declareOperator('sampleTime', _sampleTime);
export const scan = declareOperator('scan', _scan);
export const sequenceEqual = declareOperator('sequenceEqual', _sequenceEqual);
export const share = declareOperator('share', _share);
export const shareReplay = declareOperator('shareReplay', _shareReplay);
export const single = declareOperator('single', _single);
export const skip = declareOperator('skip', _skip);
export const skipLast = declareOperator('skipLast', _skipLast);
export const skipUntil = declareOperator('skipUntil', _skipUntil);
export const skipWhile = declareOperator('skipWhile', _skipWhile);
export const startWith = declareOperator('startWith', _startWith);
export const subscribeOn = declareOperator('subscribeOn', _subscribeOn);
export const switchAll = declareOperator('switchAll', _switchAll);
export const switchMap = declareOperator('switchMap', _switchMap);
export const switchMapTo = declareOperator('switchMapTo', _switchMapTo);
export const switchScan = declareOperator('switchScan', _switchScan);
export const take = declareOperator('take', _take);
export const takeLast = declareOperator('takeLast', _takeLast);
export const takeUntil = declareOperator('takeUntil', _takeUntil);
export const takeWhile = declareOperator('takeWhile', _takeWhile);
export const tap = declareOperator('tap', _tap);
export const throttle = declareOperator('throttle', _throttle);
export const throttleTime = declareOperator('throttleTime', _throttleTime);
export const throwIfEmpty = declareOperator('throwIfEmpty', _throwIfEmpty);
export const timeInterval = declareOperator('timeInterval', _timeInterval);
export const timeout = declareOperator('timeout', _timeout);
export const timeoutWith = declareOperator('timeoutWith', _timeoutWith);
export const timestamp = declareOperator('timestamp', _timestamp);
export const toArray = declareOperator('toArray', _toArray);
export const window = declareOperator('window', _window);
export const windowCount = declareOperator('windowCount', _windowCount);
export const windowTime = declareOperator('windowTime', _windowTime);
export const windowToggle = declareOperator('windowToggle', _windowToggle);
export const windowWhen = declareOperator('windowWhen', _windowWhen);
export const withLatestFrom = declareOperator(
  'withLatestFrom',
  _withLatestFrom
);
export const zipAll = declareOperator('zipAll', _zipAll);
export const zipWith = declareOperator('zipWith', _zipWith);

export * from '@rxjs-insights/rxjs-alias-module';
