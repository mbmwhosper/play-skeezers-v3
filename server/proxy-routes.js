import { createProxySession, listProxySessions, getProxySession, updateProxySession } from './proxy-session-store.js';
import { isAllowedTarget, normalizeTargetUrl } from './proxy-utils.js';

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
    const session = createProxySession({ ...body, targetUrl });
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
    const session = updateProxySession(id, body);
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
