import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { loadConfig } from './config.js';
import { checkPasswordGate, verifyPassword } from './auth.js';
import { proxyStatus } from './proxy.js';
import { createProxyRuntime } from './proxy-runtime.js';
import { getLane } from './catalog-service.js';
import { ProxyAdapter } from './proxy-adapter.js';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const proxyRuntime = createProxyRuntime();
const proxyAdapter = new ProxyAdapter();

export function createApp(rootDir) {
  return async (req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, service: 'play-skeezers-v3' }));
      return;
    }

    if (req.url === '/api/auth/verify' && req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      const result = verifyPassword(body.password || '');
      res.writeHead(result.ok ? 200 : 401, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result));
      return;
    }

    const auth = checkPasswordGate(req);
    if (!auth.ok && !req.url.startsWith('/api/auth/verify') && req.url !== '/health') {
      res.writeHead(auth.status, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(auth.body));
      return;
    }

    if (req.url === '/api/config') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(loadConfig()));
      return;
    }

    if (req.url?.startsWith('/api/lanes/')) {
      const route = req.url.split('/').pop();
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ route, items: getLane(route) }));
      return;
    }

    if (req.url === '/api/proxy/status') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ...proxyStatus(), runtime: proxyRuntime, adapter: proxyAdapter.status() }));
      return;
    }

    const rawUrl = String(req.url || '/');
    const pathname = rawUrl.split('?')[0] || '/';
    const requestPath = pathname === '/' ? '/ui/index.html' : pathname;
    const safePath = normalize(requestPath).replace(/^\.\.(\/|\\|$)+/, '');
    const filePath = join(rootDir, safePath);

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const type = MIME[extname(filePath)] || 'application/octet-stream';
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
      res.end(readFileSync(filePath));
      return;
    }

    const fallback = join(rootDir, 'ui/index.html');
    if (existsSync(fallback)) {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(readFileSync(fallback));
      return;
    }

    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  };
}
