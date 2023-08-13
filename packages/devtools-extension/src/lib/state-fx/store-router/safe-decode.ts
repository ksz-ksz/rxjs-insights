export function safeDecode(key: string) {
  try {
    return decodeURIComponent(key);
  } catch (e) {
    return key;
  }
}
