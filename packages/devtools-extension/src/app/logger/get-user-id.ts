export async function getUserId() {
  const result = await chrome.storage.local.get('userId');
  let userId = result?.userId;
  if (!userId) {
    userId = self.crypto.randomUUID();
    await chrome.storage.local.set({ userId });
  }
  return userId;
}
