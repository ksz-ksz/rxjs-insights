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
} from '@rxjs-insights/rxjs-alias';
import {
  constructor,
  creator,
  operator,
  singleton,
} from '@rxjs-insights/instrumentation';

// export const lastValueFrom = ?
// export const firstValueFrom = ?
// export const partition = ?

export const EMPTY = singleton('EMPTY', _EMPTY);
export const NEVER = singleton('NEVER', _NEVER);

export const AsyncSubject = constructor('AsyncSubject', _AsyncSubject);
export const BehaviorSubject = constructor('BehaviorSubject', _BehaviorSubject);
export const Observable = constructor('Observable', _Observable);
export const ReplaySubject = constructor('ReplaySubject', _ReplaySubject);
export const Subject = constructor('Subject', _Subject);

export type AsyncSubject<T> = _AsyncSubject<T>;
export type BehaviorSubject<T> = _BehaviorSubject<T>;
export type Observable<T> = _Observable<T>;
export type ReplaySubject<T> = _ReplaySubject<T>;
export type Subject<T> = _Subject<T>;

export const animationFrames = creator('animationFrames', _animationFrames);
export const combineLatest = creator('combineLatest', _combineLatest);
export const concat = creator('concat', _concat);
export const connectable = creator('connectable', _connectable);
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

export const audit = operator('audit', _audit);
export const auditTime = operator('auditTime', _auditTime);
export const buffer = operator('buffer', _buffer);
export const bufferCount = operator('bufferCount', _bufferCount);
export const bufferTime = operator('bufferTime', _bufferTime);
export const bufferToggle = operator('bufferToggle', _bufferToggle);
export const bufferWhen = operator('bufferWhen', _bufferWhen);
export const catchError = operator('catchError', _catchError);
export const combineAll = operator('combineAll', _combineAll);
export const combineLatestAll = operator('combineLatestAll', _combineLatestAll);
export const combineLatestWith = operator(
  'combineLatestWith',
  _combineLatestWith
);
export const concatAll = operator('concatAll', _concatAll);
export const concatMap = operator('concatMap', _concatMap);
export const concatMapTo = operator('concatMapTo', _concatMapTo);
export const concatWith = operator('concatWith', _concatWith);
export const connect = operator('connect', _connect);
export const count = operator('count', _count);
export const debounce = operator('debounce', _debounce);
export const debounceTime = operator('debounceTime', _debounceTime);
export const defaultIfEmpty = operator('defaultIfEmpty', _defaultIfEmpty);
export const delay = operator('delay', _delay);
export const delayWhen = operator('delayWhen', _delayWhen);
export const dematerialize = operator('dematerialize', _dematerialize);
export const distinct = operator('distinct', _distinct);
export const distinctUntilChanged = operator(
  'distinctUntilChanged',
  _distinctUntilChanged
);
export const distinctUntilKeyChanged = operator(
  'distinctUntilKeyChanged',
  _distinctUntilKeyChanged
);
export const elementAt = operator('elementAt', _elementAt);
export const endWith = operator('endWith', _endWith);
export const every = operator('every', _every);
export const exhaust = operator('exhaust', _exhaust);
export const exhaustAll = operator('exhaustAll', _exhaustAll);
export const exhaustMap = operator('exhaustMap', _exhaustMap);
export const expand = operator('expand', _expand);
export const filter = operator('filter', _filter);
export const finalize = operator('finalize', _finalize);
export const find = operator('find', _find);
export const findIndex = operator('findIndex', _findIndex);
export const first = operator('first', _first);
export const groupBy = operator('groupBy', _groupBy);
export const ignoreElements = operator('ignoreElements', _ignoreElements);
export const isEmpty = operator('isEmpty', _isEmpty);
export const last = operator('last', _last);
export const map = operator('map', _map);
export const mapTo = operator('mapTo', _mapTo);
export const materialize = operator('materialize', _materialize);
export const max = operator('max', _max);
export const mergeAll = operator('mergeAll', _mergeAll);
export const flatMap = operator('flatMap', _flatMap);
export const mergeMap = operator('mergeMap', _mergeMap);
export const mergeMapTo = operator('mergeMapTo', _mergeMapTo);
export const mergeScan = operator('mergeScan', _mergeScan);
export const mergeWith = operator('mergeWith', _mergeWith);
export const min = operator('min', _min);
export const multicast = operator('multicast', _multicast);
export const observeOn = operator('observeOn', _observeOn);
export const pairwise = operator('pairwise', _pairwise);
export const pluck = operator('pluck', _pluck);
export const publish = operator('publish', _publish);
export const publishBehavior = operator('publishBehavior', _publishBehavior);
export const publishLast = operator('publishLast', _publishLast);
export const publishReplay = operator('publishReplay', _publishReplay);
export const raceWith = operator('raceWith', _raceWith);
export const reduce = operator('reduce', _reduce);
export const repeat = operator('repeat', _repeat);
export const repeatWhen = operator('repeatWhen', _repeatWhen);
export const retry = operator('retry', _retry);
export const retryWhen = operator('retryWhen', _retryWhen);
export const refCount = operator('refCount', _refCount);
export const sample = operator('sample', _sample);
export const sampleTime = operator('sampleTime', _sampleTime);
export const scan = operator('scan', _scan);
export const sequenceEqual = operator('sequenceEqual', _sequenceEqual);
export const share = operator('share', _share);
export const shareReplay = operator('shareReplay', _shareReplay);
export const single = operator('single', _single);
export const skip = operator('skip', _skip);
export const skipLast = operator('skipLast', _skipLast);
export const skipUntil = operator('skipUntil', _skipUntil);
export const skipWhile = operator('skipWhile', _skipWhile);
export const startWith = operator('startWith', _startWith);
export const subscribeOn = operator('subscribeOn', _subscribeOn);
export const switchAll = operator('switchAll', _switchAll);
export const switchMap = operator('switchMap', _switchMap);
export const switchMapTo = operator('switchMapTo', _switchMapTo);
export const switchScan = operator('switchScan', _switchScan);
export const take = operator('take', _take);
export const takeLast = operator('takeLast', _takeLast);
export const takeUntil = operator('takeUntil', _takeUntil);
export const takeWhile = operator('takeWhile', _takeWhile);
export const tap = operator('tap', _tap);
export const throttle = operator('throttle', _throttle);
export const throttleTime = operator('throttleTime', _throttleTime);
export const throwIfEmpty = operator('throwIfEmpty', _throwIfEmpty);
export const timeInterval = operator('timeInterval', _timeInterval);
export const timeout = operator('timeout', _timeout);
export const timeoutWith = operator('timeoutWith', _timeoutWith);
export const timestamp = operator('timestamp', _timestamp);
export const toArray = operator('toArray', _toArray);
export const window = operator('window', _window);
export const windowCount = operator('windowCount', _windowCount);
export const windowTime = operator('windowTime', _windowTime);
export const windowToggle = operator('windowToggle', _windowToggle);
export const windowWhen = operator('windowWhen', _windowWhen);
export const withLatestFrom = operator('withLatestFrom', _withLatestFrom);
export const zipAll = operator('zipAll', _zipAll);
export const zipWith = operator('zipWith', _zipWith);

export * from '@rxjs-insights/rxjs-alias';
