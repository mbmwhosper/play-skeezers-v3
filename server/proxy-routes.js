import {
  createProxySession,
  listProxySessions,
  getProxySession,
  updateProxySession,
  deleteProxySession,
  touchProxySession,
} from './proxy-session-store.js';
import { isAllowedTarget, normalizeTargetUrl, getTargetMeta } from './proxy-utils.js';

export async function handleProxyRoute(req, res) {
  if (req.url === '/api/proxy/sessions' && req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ items: listProxySessions() }));
    return true;
  }

  if (req.url === '/api/proxy/sessions' && req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    const targetUrl = normalizeTargetUrl(body.targetUrl || '');
    if (targetUrl && !isAllowedTarget(targetUrl)) {
      res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Invalid target URL' }));
      return true;
    }
    const session = createProxySession({ ...body, targetUrl, meta: getTargetMeta(targetUrl) });
    res.writeHead(201, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(session));
    return true;
  }

  if (req.url?.startsWith('/api/proxy/sessions/') && req.method === 'GET') {
    const id = req.url.split('/').pop();
    const session = getProxySession(id);
    if (!session) {
      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return true;
    }
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(session));
    return true;
  }

  if (req.url?.startsWith('/api/proxy/sessions/') && req.method === 'PATCH') {
    const id = req.url.split('/').pop();
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    if (body.targetUrl && !isAllowedTarget(body.targetUrl)) {
      res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Invalid target URL' }));
      return true;
    }
    const patch = {
      ...body,
      ...(body.targetUrl ? { meta: getTargetMeta(body.targetUrl) } : {}),
    };
    const session = updateProxySession(id, patch);
    if (!session) {
      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return true;
    }
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(session));
    return true;
  }

  if (req.url?.startsWith('/api/proxy/sessions/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const deleted = deleteProxySession(id);
    if (!deleted) {
      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return true;
    }
    res.writeHead(204);
    res.end();
    return true;
  }

  if (req.url?.startsWith('/api/proxy/open/') && req.method === 'POST') {
    const id = req.url.split('/').pop();
    const session = touchProxySession(id);
    if (!session) {
      res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return true;
    }
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(session));
    return true;
  }

  return false;
}
