function convert(x: string) {
  if (x.startsWith('<') && x.endsWith('>')) {
    return x.substring(1, x.length - 1);
  } else {
    return `<${x}>`;
  }
}

function getSourceCommonPathsMapping(path: string[]) {
  const oldRootSeg = path.at(0)!;
  const newRootSeg = path.at(-1)!;
  const keysOnPath = new Map<string, string>();
  for (let i = 0; i < path.length; i++) {
    const fromKey = path.slice(0, i + 1).join('.');
    const toKey = path
      .slice(i)
      .map((x) => (x === oldRootSeg || x === newRootSeg ? convert(x) : x))
      .join('.');
    keysOnPath.set(fromKey, toKey);
  }
  return keysOnPath;
}

function getDestinationCommonPathsMapping(path: string[]) {
  const oldRootSeg = path.at(-1)!;
  const newRootSeg = path.at(0)!;
  const keysOnPath = new Map<string, string>();
  for (let i = 0; i < path.length; i++) {
    const fromKey = path.slice(i).join('.');
    const toKey = path
      .slice(0, i + 1)
      .map((x) => (x === oldRootSeg || x === newRootSeg ? convert(x) : x))
      .join('.');
    keysOnPath.set(fromKey, toKey);
  }
  return keysOnPath;
}

function rebaseToSourceKey(
  targetKey: string,
  keyMapping: Record<string, number>
) {
  const rebaseKeyMapping: Record<string, number> = {};
  const path = targetKey.split('.');
  const keysOnPath = getSourceCommonPathsMapping(path);
  const newRootKey = `<${path.at(-1)}>`;

  const oldTargetKeyAsPrefix = `${targetKey}.`;
  const newTargetKeyAsSuffix = path.map((x, i) =>
    i === 0 || i === path.length - 1 ? convert(x) : x
  );

  for (const key in keyMapping) {
    if (key.startsWith(oldTargetKeyAsPrefix)) {
      rebaseKeyMapping[
        `${newRootKey}.${key.substring(oldTargetKeyAsPrefix.length)}`
      ] = keyMapping[key];
    } else if (keysOnPath.has(key)) {
      rebaseKeyMapping[keysOnPath.get(key)!] = keyMapping[key];
    } else {
      rebaseKeyMapping[
        [...key.split('.').slice(0, -1), ...newTargetKeyAsSuffix].join('.')
      ] = keyMapping[key];
    }
  }

  return rebaseKeyMapping;
}

function rebaseToDestinationKey(
  targetKey: string,
  keyMapping: Record<string, number>
) {
  const rebaseKeyMapping: Record<string, number> = {};
  const path = targetKey.split('.');
  const keysOnPath = getDestinationCommonPathsMapping(path);
  const rootKey = `<${path.at(0)}>`;

  const oldTargetKeyAsSuffix = `.${targetKey}`;
  const newTargetKeyAsPrefix = path.map((x, i) =>
    i === 0 || i === path.length - 1 ? convert(x) : x
  );

  for (const key in keyMapping) {
    if (key.endsWith(oldTargetKeyAsSuffix)) {
      rebaseKeyMapping[
        `${key.substring(
          0,
          key.length - oldTargetKeyAsSuffix.length
        )}.${rootKey}`
      ] = keyMapping[key];
    } else if (keysOnPath.has(key)) {
      rebaseKeyMapping[keysOnPath.get(key)!] = keyMapping[key];
    } else {
      rebaseKeyMapping[
        [...newTargetKeyAsPrefix, ...key.split('.').slice(1)].join('.')
      ] = keyMapping[key];
    }
  }

  return rebaseKeyMapping;
}

export function rebaseKeys(
  keyMapping: Record<string, number>,
  targetKey: string
): Record<string, number> {
  if (targetKey.startsWith('<')) {
    return rebaseToSourceKey(targetKey, keyMapping);
  } else {
    return rebaseToDestinationKey(targetKey, keyMapping);
  }
}
