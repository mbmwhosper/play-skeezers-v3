function authHeaders(authToken, base = {}) {
  const headers = new Headers(base);
  if (authToken) headers.set('x-v3-password', authToken);
  return headers;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 204) return null;
  return response.json();
}

async function fetchSessions(authToken) {
  const data = await fetchJson('/api/proxy/sessions', {
    headers: authHeaders(authToken)
  });
  return data?.items || [];
}

function renderSessionList(sessions) {
  if (!sessions.length) return '<p>No proxy sessions yet.</p>';
  return sessions.map((session) => `
    <article class="lane-card compact">
      <div class="card-head">
        <div>
          <h3>${session.title}</h3>
          <p>${session.targetUrl || 'No target URL'}</p>
        </div>
        <div class="card-badges">
          <span class="card-badge">${session.status}</span>
          ${session.meta?.recommendedMode ? `<span class="card-badge">${session.meta.recommendedMode}</span>` : ''}
        </div>
      </div>
      <small>Opened ${session.launchCount || 0} time(s)</small>
      <div class="lane-actions">
        <button data-session-open="${session.id}">Open</button>
        <button class="ghost" data-session-delete="${session.id}">Delete</button>
      </div>
    </article>
  `).join('');
}

function renderSessionDetail(session) {
  const blockedByIframe = Boolean(session.meta?.blockedByIframe);
  return `
    <article class="lane-card">
      <div class="card-head">
        <div>
          <p class="eyebrow">Active Session</p>
          <h3>${session.title}</h3>
        </div>
        <div class="card-badges">
          <span class="card-badge">${session.status}</span>
          ${session.meta?.recommendedMode ? `<span class="card-badge">${session.meta.recommendedMode}</span>` : ''}
        </div>
      </div>
      <p>Target: ${session.targetUrl || 'No target URL set'}</p>
      <div class="lane-actions">
        <a href="/proxy/view/${session.id}" target="_blank" rel="noopener"><button>Open Proxy View</button></a>
        ${session.targetUrl ? `<a href="${session.targetUrl}" target="_blank" rel="noopener"><button class="ghost">Open Direct</button></a>` : ''}
      </div>
      <small>${blockedByIframe ? 'This target will likely block iframe embedding, so direct-open is preferred.' : 'This target supports embedded preview unless the remote site denies framing.'}</small>
    </article>
  `;
}

export function browserWorkspaceMarkup() {
  return `
    <section class="workspace-shell">
      <div class="workspace-toolbar">
        <button class="ghost">Back</button>
        <button class="ghost">Forward</button>
        <button class="ghost">Refresh</button>
        <input class="workspace-address" id="workspaceAddress" value="https://now.gg" />
        <button id="workspaceOpen">Open</button>
      </div>
      <div class="workspace-body">
        <aside class="workspace-sidebar">
          <h3>Workspace Apps</h3>
          <button data-workspace-target="https://now.gg">Now.gg</button>
          <button data-workspace-target="https://play.geforcenow.com">GeForce NOW</button>
          <button data-workspace-target="https://example.com">Safe Preview Test</button>
        </aside>
        <section class="workspace-view">
          <div class="workspace-pane">
            <p class="eyebrow">Browser workspace</p>
            <h3>Customizable Interstellar-style shell</h3>
            <p>This workspace tracks sessions, opens safe previews when possible, and falls back to direct-open for harder targets.</p>
            <div class="workspace-grid">
              <article class="lane-card"><h3>Managed Sessions</h3><p>Saved browser sessions persist across restarts.</p></article>
              <article class="lane-card"><h3>Proxy View</h3><p>Open a session in its dedicated view with iframe fallback handling.</p></article>
              <article class="lane-card"><h3>Launch Modes</h3><p>Targets can be flagged for embedded preview or external-tab behavior.</p></article>
            </div>
            <div class="workspace-output" id="workspaceOutput">
              <p>No proxy session yet. Start with a target to create one.</p>
            </div>
            <div class="workspace-browser-pane" id="workspaceBrowserPane">
              <p>Browser pane idle.</p>
            </div>
            <div class="workspace-sessions" id="workspaceSessions">
              <p>Loading sessions...</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  `;
}

export async function bindBrowserWorkspace(authToken = '') {
  const openButton = document.getElementById('workspaceOpen');
  const addressInput = document.getElementById('workspaceAddress');
  const output = document.getElementById('workspaceOutput');
  const browserPane = document.getElementById('workspaceBrowserPane');
  const sessionsEl = document.getElementById('workspaceSessions');
  if (!openButton || !addressInput || !output || !sessionsEl || !browserPane) return;

  async function openSession(id) {
    await fetchJson(`/api/proxy/open/${id}`, {
      method: 'POST',
      headers: authHeaders(authToken)
    });
    const session = await fetchJson(`/api/proxy/sessions/${id}`, {
      headers: authHeaders(authToken)
    });
    output.innerHTML = renderSessionDetail(session);
    browserPane.innerHTML = session.meta?.blockedByIframe
      ? `
        <article class="lane-card">
          <p class="eyebrow">Launch mode</p>
          <h3>External tab recommended</h3>
          <p>${session.targetUrl}</p>
          <small>This target is known to block iframe embedding. Use Open Proxy View or Open Direct.</small>
        </article>
      `
      : `
        <article class="lane-card">
          <p class="eyebrow">Embedded preview</p>
          <h3>${session.title}</h3>
          <iframe src="${session.targetUrl}" referrerpolicy="no-referrer"></iframe>
        </article>
      `;
  }

  async function refreshSessions() {
    const sessions = await fetchSessions(authToken);
    sessionsEl.innerHTML = renderSessionList(sessions);
    sessionsEl.querySelectorAll('[data-session-open]').forEach((button) => {
      button.addEventListener('click', async () => {
        await openSession(button.dataset.sessionOpen);
        await refreshSessions();
      });
    });
    sessionsEl.querySelectorAll('[data-session-delete]').forEach((button) => {
      button.addEventListener('click', async () => {
        await fetch(`/api/proxy/sessions/${button.dataset.sessionDelete}`, {
          method: 'DELETE',
          headers: authHeaders(authToken)
        });
        output.innerHTML = '<p>Session deleted.</p>';
        browserPane.innerHTML = '<p>Browser pane idle.</p>';
        await refreshSessions();
      });
    });
  }

  document.querySelectorAll('[data-workspace-target]').forEach((button) => {
    button.addEventListener('click', () => {
      addressInput.value = button.dataset.workspaceTarget;
    });
  });

  openButton.addEventListener('click', async () => {
    const session = await fetchJson('/api/proxy/sessions', {
      method: 'POST',
      headers: authHeaders(authToken, { 'content-type': 'application/json' }),
      body: JSON.stringify({ title: 'Browser Session', targetUrl: addressInput.value })
    });
    if (!session?.id) {
      output.innerHTML = `<p>Failed: ${session?.error || 'Unknown error'}</p>`;
      return;
    }
    await openSession(session.id);
    await refreshSessions();
  });

  refreshSessions();
}
