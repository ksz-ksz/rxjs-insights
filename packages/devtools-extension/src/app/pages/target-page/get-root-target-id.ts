function getRootTargetIdFromSeg(seg: string) {
  return Number(seg.substring(1, seg.length - 1));
}

export function getRootTargetIdFromKey(key: string) {
  if (key.startsWith('<')) {
    return getRootTargetIdFromSeg(key.split('.').at(0)!);
  } else {
    return getRootTargetIdFromSeg(key.split('.').at(-1)!);
  }
}

function getTargetIdFromSeg(seg: string) {
  if (seg.startsWith('<')) {
    return Number(seg.substring(1, seg.length - 1));
  } else {
    return Number(seg);
  }
}

export function getTargetIdFromKey(key: string) {
  if (key.startsWith('<')) {
    return getTargetIdFromSeg(key.split('.').at(-1)!);
  } else {
    return getTargetIdFromSeg(key.split('.').at(0)!);
  }
}
