export function browserWorkspaceMarkup() {
  return `
    <section class="workspace-shell">
      <div class="workspace-toolbar">
        <button class="ghost">Back</button>
        <button class="ghost">Forward</button>
        <button class="ghost">Refresh</button>
        <input class="workspace-address" id="workspaceAddress" value="https://example.com" />
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
            <div class="workspace-grid">
              <article class="lane-card"><h3>Browser Tab</h3><p>Reserved for the proxy-backed browsing surface.</p></article>
              <article class="lane-card"><h3>Cloud Apps</h3><p>Launchers for Now.gg and GeForce NOW style app surfaces.</p></article>
              <article class="lane-card"><h3>Inspect</h3><p>Power-tool surface for inspect-style functionality later.</p></article>
            </div>
            <div class="workspace-output" id="workspaceOutput">
              <p>No proxy session yet.</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  `;
}

export function bindBrowserWorkspace() {
  const openButton = document.getElementById('workspaceOpen');
  const addressInput = document.getElementById('workspaceAddress');
  const output = document.getElementById('workspaceOutput');
  if (!openButton || !addressInput || !output) return;

  openButton.addEventListener('click', async () => {
    const response = await fetch('/api/proxy/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Browser Session', targetUrl: addressInput.value })
    });
    const session = await response.json();
    output.innerHTML = `
      <article class="lane-card">
        <h3>${session.title}</h3>
        <p>Target: ${session.targetUrl || 'unset'}</p>
        <small>Status: ${session.status}</small>
      </article>
    `;
  });
}
