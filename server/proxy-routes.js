import { createProxySession, listProxySessions, getProxySession, updateProxySession } from './proxy-session-store.js';

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
    const session = createProxySession(body);
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
