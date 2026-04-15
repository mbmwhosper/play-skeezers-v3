function authHeaders(authToken, base = {}) {
  const headers = new Headers(base);
  if (authToken) headers.set('x-v3-password', authToken);
  return headers;
}

async function fetchSessions(authToken) {
  const response = await fetch('/api/proxy/sessions', {
    headers: authHeaders(authToken)
  });
  const data = await response.json();
  return data.items || [];
}

function renderSessionList(sessions) {
  if (!sessions.length) return '<p>No proxy sessions yet.</p>';
  return sessions.map((session) => `
    <article class="lane-card">
      <h3>${session.title}</h3>
      <p>${session.targetUrl || 'No target URL'}</p>
      <small>Status: ${session.status}</small>
      <div class="lane-actions">
        <button data-session-id="${session.id}">Open Session</button>
      </div>
    </article>
  `).join('');
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
          <button data-workspace-app="browser">Browser</button>
          <button data-workspace-app="nowgg">Now.gg</button>
          <button data-workspace-app="geforce">GeForce NOW</button>
          <button data-workspace-app="inspect">Inspect Tool</button>
        </aside>
        <section class="workspace-view">
          <div class="workspace-pane">
            <p class="eyebrow">Browser workspace</p>
            <h3>Interstellar-style app shell</h3>
            <p>This is the dedicated workspace surface where browser tabs, cloud gaming launchers, proxy sessions, and utility tools will live.</p>
            <p class="eyebrow">Current target</p>
            <p>Render-first shell test now, fuller proxy runtime next. `now.gg` is treated as an explicit compatibility target, not a vague maybe.</p>
            <div class="workspace-grid">
              <article class="lane-card"><h3>Browser Tab</h3><p>Reserved for the proxy-backed browsing surface.</p></article>
              <article class="lane-card"><h3>Cloud Apps</h3><p>Launchers for Now.gg and GeForce NOW style app surfaces.</p></article>
              <article class="lane-card"><h3>Inspect</h3><p>Power-tool surface for inspect-style functionality later.</p></article>
            </div>
            <div class="workspace-output" id="workspaceOutput">
              <p>No proxy session yet. Start with a simple target or test `https://now.gg` to validate the workspace flow.</p>
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

  async function refreshSessions() {
    const sessions = await fetchSessions(authToken);
    sessionsEl.innerHTML = renderSessionList(sessions);
    sessionsEl.querySelectorAll('[data-session-id]').forEach((button) => {
      button.addEventListener('click', async () => {
        const response = await fetch(`/api/proxy/sessions/${button.dataset.sessionId}`, {
          headers: authHeaders(authToken)
        });
        const session = await response.json();
        output.innerHTML = `
          <article class="lane-card">
            <h3>${session.title}</h3>
            <p>Target: ${session.targetUrl || 'unset'}</p>
            <small>Status: ${session.status}</small>
          </article>
        `;
        browserPane.innerHTML = `
          <article class="lane-card">
            <h3>Active Session</h3>
            <p>${session.targetUrl || 'No target URL set'}</p>
            <div class="lane-actions">
              <a href="/proxy/view/${session.id}" target="_blank" rel="noopener"><button>Open Proxy View</button></a>
            </div>
            <small>This opens the current proxy-view route contract for the session.</small>
          </article>
        `;
      });
    });
  }

  openButton.addEventListener('click', async () => {
    const response = await fetch('/api/proxy/sessions', {
      method: 'POST',
      headers: authHeaders(authToken, { 'content-type': 'application/json' }),
      body: JSON.stringify({ title: 'Browser Session', targetUrl: addressInput.value })
    });
    const session = await response.json();
    if (!response.ok) {
      output.innerHTML = `<p>Failed: ${session.error || 'Unknown error'}</p>`;
      return;
    }
    output.innerHTML = `
      <article class="lane-card">
        <h3>${session.title}</h3>
        <p>Target: ${session.targetUrl || 'unset'}</p>
        <small>Status: ${session.status}</small>
      </article>
    `;
    browserPane.innerHTML = `
      <article class="lane-card">
        <h3>Active Session</h3>
        <p>${session.targetUrl || 'No target URL set'}</p>
        <div class="lane-actions">
          <a href="/proxy/view/${session.id}" target="_blank" rel="noopener"><button>Open Proxy View</button></a>
        </div>
        <small>This opens the current proxy-view route contract for the session.</small>
      </article>
    `;
    refreshSessions();
  });

  refreshSessions();
}
