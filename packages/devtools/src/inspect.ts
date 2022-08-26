export type InspectFunction = typeof inspect;

let inspectFunction: InspectFunction = function inspectNoop<T>(target: T) {
  return target;
};

export function setInspectFunction(inspect: InspectFunction) {
  inspectFunction = inspect;
}

/**
 * If the RxJS Insights Devtools are connected and if the `target` is an instance of `Subscriber` or `Observable`,
 * sends the `target` to the devtools for analysis. Noop otherwise.
 *
 * @param target  the received target.
 */
export function inspect<T>(target: T): T {
  return inspectFunction(target);
}
