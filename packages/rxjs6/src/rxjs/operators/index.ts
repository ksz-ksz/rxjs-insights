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
  combineLatest as _combineLatest,
  concat as _concat,
  concatAll as _concatAll,
  concatMap as _concatMap,
  concatMapTo as _concatMapTo,
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
  merge as _merge,
  mergeAll as _mergeAll,
  mergeMap as _mergeMap,
  mergeMapTo as _mergeMapTo,
  mergeScan as _mergeScan,
  min as _min,
  multicast as _multicast,
  observeOn as _observeOn,
  onErrorResumeNext as _onErrorResumeNext,
  pairwise as _pairwise,
  pluck as _pluck,
  publish as _publish,
  publishBehavior as _publishBehavior,
  publishLast as _publishLast,
  publishReplay as _publishReplay,
  race as _race,
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
  zip as _zip,
  zipAll as _zipAll,
} from '@rxjs-insights/rxjs-alias-module/operators';
import { declareOperator } from '@rxjs-insights/core/declarations';

export const audit = declareOperator(_audit, 'audit');
export const auditTime = declareOperator(_auditTime, 'auditTime');
export const buffer = declareOperator(_buffer, 'buffer');
export const bufferCount = declareOperator(_bufferCount, 'bufferCount');
export const bufferTime = declareOperator(_bufferTime, 'bufferTime');
export const bufferToggle = declareOperator(_bufferToggle, 'bufferToggle');
export const bufferWhen = declareOperator(_bufferWhen, 'bufferWhen');
export const catchError = declareOperator(_catchError, 'catchError');
export const combineAll = declareOperator(_combineAll, 'combineAll');
export const combineLatest = declareOperator(_combineLatest, 'combineLatest');
export const concat = declareOperator(_concat, 'concat');
export const concatAll = declareOperator(_concatAll, 'concatAll');
export const concatMap = declareOperator(_concatMap, 'concatMap');
export const concatMapTo = declareOperator(_concatMapTo, 'concatMapTo');
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
export const merge = declareOperator(_merge, 'merge');
export const mergeAll = declareOperator(_mergeAll, 'mergeAll');
export const mergeMap = declareOperator(_mergeMap, 'mergeMap');
export const flatMap = declareOperator(_flatMap, 'flatMap');
export const mergeMapTo = declareOperator(_mergeMapTo, 'mergeMapTo');
export const mergeScan = declareOperator(_mergeScan, 'mergeScan');
export const min = declareOperator(_min, 'min');
export const multicast = declareOperator(_multicast, 'multicast');
export const observeOn = declareOperator(_observeOn, 'observeOn');
export const onErrorResumeNext = declareOperator(
  _onErrorResumeNext,
  'onErrorResumeNext'
);
export const pairwise = declareOperator(_pairwise, 'pairwise');
export const pluck = declareOperator(_pluck, 'pluck');
export const publish = declareOperator(_publish, 'publish');
export const publishBehavior = declareOperator(
  _publishBehavior,
  'publishBehavior'
);
export const publishLast = declareOperator(_publishLast, 'publishLast');
export const publishReplay = declareOperator(_publishReplay, 'publishReplay');
export const race = declareOperator(_race, 'race');
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
export const zip = declareOperator(_zip, 'zip');
export const zipAll = declareOperator(_zipAll, 'zipAll');

export * from '@rxjs-insights/rxjs-alias-module/operators';
