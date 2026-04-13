import { readFileSync, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { loadConfig } from './config.js';
import { checkPasswordGate, verifyPassword } from './auth.js';
import { proxyStatus } from './proxy.js';
import { createProxyRuntime } from './proxy-runtime.js';

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

    if (req.url === '/api/proxy/status') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ...proxyStatus(), runtime: proxyRuntime }));
      return;
    }

    const requestPath = req.url === '/' ? '/ui/index.html' : req.url;
    const safePath = normalize(requestPath).replace(/^\.\.(\/|\\|$)+/, '');
    const filePath = join(rootDir, safePath);

    if (existsSync(filePath)) {
      const type = MIME[extname(filePath)] || 'application/octet-stream';
      res.writeHead(200, { 'content-type': type });
      res.end(readFileSync(filePath));
      return;
    }

    const fallback = join(rootDir, 'ui/index.html');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(readFileSync(fallback));
  };
}
