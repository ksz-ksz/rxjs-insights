export function areArgsEqual(args1: any[], args2: any[]) {
  const n = Math.max(args1.length, args2.length);
  for (let i = 0; i < n; i++) {
    const arg1 = args1[i];
    const arg2 = args2[i];
    if (arg1 !== arg2) {
      return false;
    }
  }
  return true;
}
