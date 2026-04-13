const sessions = new Map();

export function listProxySessions() {
  return [...sessions.values()];
}

export function createProxySession(input = {}) {
  const session = {
    id: crypto.randomUUID(),
    title: input.title || 'New Proxy Session',
    targetUrl: input.targetUrl || '',
    createdAt: new Date().toISOString(),
    status: 'created'
  };
  sessions.set(session.id, session);
  return session;
}

export function getProxySession(id) {
  return sessions.get(id) || null;
}
