import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeTargetUrl } from './proxy-utils.js';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '..', 'data');
const storePath = resolve(dataDir, 'proxy-sessions.json');

function ensureStore() {
  mkdirSync(dataDir, { recursive: true });
  if (!existsSync(storePath)) {
    writeFileSync(storePath, JSON.stringify({ items: [] }, null, 2));
  }
}

function loadSessions() {
  ensureStore();
  try {
    const parsed = JSON.parse(readFileSync(storePath, 'utf8'));
    return new Map((parsed.items || []).map((session) => [session.id, session]));
  } catch {
    return new Map();
  }
}

const sessions = loadSessions();

function persist() {
  ensureStore();
  writeFileSync(storePath, JSON.stringify({ items: [...sessions.values()] }, null, 2));
}

export function listProxySessions() {
  return [...sessions.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createProxySession(input = {}) {
  const now = new Date().toISOString();
  const session = {
    id: crypto.randomUUID(),
    title: input.title || 'New Proxy Session',
    targetUrl: normalizeTargetUrl(input.targetUrl || ''),
    createdAt: now,
    updatedAt: now,
    status: 'created',
    notes: input.notes || '',
    launchCount: 0,
    lastOpenedAt: null,
  };
  sessions.set(session.id, session);
  persist();
  return session;
}

export function getProxySession(id) {
  return sessions.get(id) || null;
}

export function updateProxySession(id, patch = {}) {
  const current = sessions.get(id);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    targetUrl: patch.targetUrl ? normalizeTargetUrl(patch.targetUrl) : current.targetUrl,
    updatedAt: new Date().toISOString()
  };
  sessions.set(id, next);
  persist();
  return next;
}

export function deleteProxySession(id) {
  const existed = sessions.delete(id);
  if (existed) persist();
  return existed;
}

export function touchProxySession(id) {
  const current = sessions.get(id);
  if (!current) return null;
  const next = {
    ...current,
    launchCount: Number(current.launchCount || 0) + 1,
    lastOpenedAt: new Date().toISOString(),
    status: 'opened',
    updatedAt: new Date().toISOString()
  };
  sessions.set(id, next);
  persist();
  return next;
}
