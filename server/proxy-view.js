import { getProxySession, touchProxySession } from './proxy-session-store.js';

export function renderProxyView(sessionId) {
  const session = touchProxySession(sessionId) || getProxySession(sessionId);
  if (!session) {
    return {
      status: 404,
      html: '<h1>Session not found</h1>'
    };
  }

  const blockedByIframe = Boolean(session.meta?.blockedByIframe);
  const recommendedMode = session.meta?.recommendedMode || 'embedded-preview';

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
    .card { width: min(1000px, 100%); border: 1px solid rgba(120,164,255,.18); border-radius: 20px; background: linear-gradient(180deg, rgba(18,35,61,.92), rgba(10,18,31,.95)); padding: 1.25rem; }
    .muted { color: #9fb3d9; }
    .actions { display: flex; gap: .75rem; flex-wrap: wrap; margin-top: 1rem; }
    a.button { display: inline-flex; padding: .8rem 1rem; border-radius: 14px; border: 1px solid rgba(120,164,255,.2); color: #edf4ff; text-decoration: none; }
    iframe { width: 100%; height: 70vh; border: 0; border-radius: 14px; background: white; margin-top: 1rem; }
    .notice { margin-top: 1rem; padding: 1rem; border-radius: 16px; background: rgba(255,255,255,.04); border: 1px solid rgba(120,164,255,.12); }
  </style>
</head>
<body>
  <div class="shell">
    <div class="card">
      <p class="muted">Proxy session preview</p>
      <h1>${session.title}</h1>
      <p class="muted">Target: ${session.targetUrl || 'No target URL set'}</p>
      <p class="muted">Recommended mode: ${recommendedMode}</p>
      <div class="actions">
        ${session.targetUrl ? `<a class="button" href="${session.targetUrl}" target="_blank" rel="noopener">Open target directly</a>` : ''}
      </div>
      ${!session.targetUrl ? '<p>No target URL set for this session yet.</p>' : blockedByIframe ? `
        <div class="notice">
          <strong>This target will likely block iframe embedding.</strong>
          <p class="muted">Use the direct-open button above for services like now.gg or GeForce NOW. The workspace still tracks the session and keeps the launch surface organized.</p>
        </div>
      ` : `<iframe src="${session.targetUrl}" referrerpolicy="no-referrer"></iframe>`}
    </div>
  </div>
</body>
</html>`
  };
}
