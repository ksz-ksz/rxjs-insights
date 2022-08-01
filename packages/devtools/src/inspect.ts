type InspectFunction = typeof inspect;

let inspectFunction: InspectFunction = function inspectNoop<T>(target: T) {
  return target;
};

export function setInspectFunction(inspect: InspectFunction) {
  inspectFunction = inspect;
}

export function inspect<T>(target: T): T {
  return inspectFunction(target);
}
