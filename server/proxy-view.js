import { getProxySession } from './proxy-session-store.js';

export function renderProxyView(sessionId) {
  const session = getProxySession(sessionId);
  if (!session) {
    return {
      status: 404,
      html: '<h1>Session not found</h1>'
    };
  }

  return {
    status: 200,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${session.title}</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #0b1425; color: #edf4ff; }
    .shell { min-height: 100vh; display: grid; place-items: center; padding: 2rem; }
    .card { width: min(900px, 100%); border: 1px solid rgba(120,164,255,.18); border-radius: 20px; background: linear-gradient(180deg, rgba(18,35,61,.92), rgba(10,18,31,.95)); padding: 1.25rem; }
    .muted { color: #9fb3d9; }
    iframe { width: 100%; height: 70vh; border: 0; border-radius: 14px; background: white; }
  </style>
</head>
<body>
  <div class="shell">
    <div class="card">
      <p class="muted">Proxy session preview</p>
      <h1>${session.title}</h1>
      <p class="muted">Target: ${session.targetUrl || 'No target URL set'}</p>
      ${session.targetUrl ? `<iframe src="${session.targetUrl}" referrerpolicy="no-referrer"></iframe>` : '<p>No target URL set for this session yet.</p>'}
    </div>
  </div>
</body>
</html>`
  };
}
