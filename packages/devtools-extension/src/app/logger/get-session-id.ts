let sessionId: string | undefined = undefined;
export async function getSessionId() {
  if (!sessionId) {
    sessionId = self.crypto.randomUUID();
  }
  return sessionId;
}
