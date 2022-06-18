export function formatTimestamp(timestamp: number) {
  const t = new Date(timestamp);
  const h = String(t.getHours()).padStart(2, '0');
  const m = String(t.getMinutes()).padStart(2, '0');
  const s = String(t.getSeconds()).padStart(2, '0');
  const ms = String(t.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}
