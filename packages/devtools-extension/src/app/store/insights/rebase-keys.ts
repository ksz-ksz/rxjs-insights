function getKeysOnPath(path: number[]) {
  const keysOnPath: string[] = [];
  for (let i = 0; i < path.length; i++) {
    keysOnPath.push(path.slice(0, i + 1).join('.'));
  }
  return keysOnPath;
}

export function rebaseKeys(
  keyMapping: Record<string, number>,
  targetKey: string
): Record<string, number> {
  const rebaseKeyMapping: Record<string, number> = {};
  const path = targetKey.split('.').map(Number);
  const reversePath = [...path].reverse();
  const targetId = path.at(-1)!;

  const targetKeyAsPrefix = `${targetKey}.`;
  const keysOnPath = getKeysOnPath(path);
  const reversePathPrefix = reversePath.slice(0, -1).join('.');

  for (const key in keyMapping) {
    if (key.startsWith(targetKeyAsPrefix)) {
      rebaseKeyMapping[
        `${targetId}.${key.substring(targetKeyAsPrefix.length)}`
      ] = keyMapping[key];
    } else if (keysOnPath.includes(key)) {
      const id = Number(key.split('.').at(-1)!);
      const indexOfId = reversePath.indexOf(id);
      rebaseKeyMapping[reversePath.slice(0, indexOfId + 1).join('.')] =
        keyMapping[key];
    } else {
      rebaseKeyMapping[`${reversePathPrefix}.${key}`] = keyMapping[key];
    }
  }

  return rebaseKeyMapping;
}
