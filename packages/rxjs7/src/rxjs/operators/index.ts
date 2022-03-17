import '@rxjs-insights/rxjs-install-module';
import {
  audit as _audit,
  auditTime as _auditTime,
  buffer as _buffer,
  bufferCount as _bufferCount,
  bufferTime as _bufferTime,
  bufferToggle as _bufferToggle,
  bufferWhen as _bufferWhen,
  catchError as _catchError,
  combineAll as _combineAll,
  combineLatestAll as _combineLatestAll,
  combineLatestWith as _combineLatestWith,
  concatAll as _concatAll,
  concatMap as _concatMap,
  concatMapTo as _concatMapTo,
  concatWith as _concatWith,
  connect as _connect,
  count as _count,
  debounce as _debounce,
  debounceTime as _debounceTime,
  defaultIfEmpty as _defaultIfEmpty,
  delay as _delay,
  delayWhen as _delayWhen,
  dematerialize as _dematerialize,
  distinct as _distinct,
  distinctUntilChanged as _distinctUntilChanged,
  distinctUntilKeyChanged as _distinctUntilKeyChanged,
  elementAt as _elementAt,
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
  groupBy as _groupBy,
  ignoreElements as _ignoreElements,
  isEmpty as _isEmpty,
  last as _last,
  map as _map,
  mapTo as _mapTo,
  materialize as _materialize,
  max as _max,
  mergeAll as _mergeAll,
  mergeMap as _mergeMap,
  mergeMapTo as _mergeMapTo,
  mergeScan as _mergeScan,
  mergeWith as _mergeWith,
  min as _min,
  multicast as _multicast,
  observeOn as _observeOn,
  pairwise as _pairwise,
  pluck as _pluck,
  publish as _publish,
  publishBehavior as _publishBehavior,
  publishLast as _publishLast,
  publishReplay as _publishReplay,
  raceWith as _raceWith,
  reduce as _reduce,
  refCount as _refCount,
  repeat as _repeat,
  repeatWhen as _repeatWhen,
  retry as _retry,
  retryWhen as _retryWhen,
  sample as _sample,
  sampleTime as _sampleTime,
  scan as _scan,
  sequenceEqual as _sequenceEqual,
  share as _share,
  shareReplay as _shareReplay,
  single as _single,
  skip as _skip,
  skipLast as _skipLast,
  skipUntil as _skipUntil,
  skipWhile as _skipWhile,
  startWith as _startWith,
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
  throwIfEmpty as _throwIfEmpty,
  timeInterval as _timeInterval,
  timeout as _timeout,
  timeoutWith as _timeoutWith,
  timestamp as _timestamp,
  toArray as _toArray,
  window as _window,
  windowCount as _windowCount,
  windowTime as _windowTime,
  windowToggle as _windowToggle,
  windowWhen as _windowWhen,
  withLatestFrom as _withLatestFrom,
  zipAll as _zipAll,
  zipWith as _zipWith,
} from '@rxjs-insights/rxjs-alias-module/operators';
import { operator } from '@rxjs-insights/instrumentation';

// export const lastValueFrom = ?
// export const firstValueFrom = ?
// export const partition = ?

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

export * from '@rxjs-insights/rxjs-alias-module/operators';
