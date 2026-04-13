const sessions = new Map();

export function listProxySessions() {
  return [...sessions.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
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

export function updateProxySession(id, patch = {}) {
  const current = sessions.get(id);
  if (!current) return null;
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  sessions.set(id, next);
  return next;
}
