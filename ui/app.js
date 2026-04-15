import { browserWorkspaceMarkup, bindBrowserWorkspace } from './workspace.js';

const routeTitle = document.getElementById('routeTitle');
const tabsEl = document.getElementById('tabs');
const tabContentEl = document.getElementById('tabContent');
const newTabBtn = document.getElementById('newTabBtn');
const searchInput = document.getElementById('globalSearch');
const laneMetaEl = document.getElementById('laneMeta');
const laneActionsEl = document.getElementById('laneActions');
const navButtons = [...document.querySelectorAll('[data-route]')];
const passwordGateEl = document.getElementById('passwordGate');
const passwordInputEl = document.getElementById('passwordInput');
const passwordSubmitEl = document.getElementById('passwordSubmit');
const passwordErrorEl = document.getElementById('passwordError');
const passwordHintEl = document.getElementById('passwordHint');

const state = {
  activeRoute: localStorage.getItem('v3.activeRoute') || 'home',
  activeTheme: localStorage.getItem('v3.theme') || 'default',
  searchQuery: localStorage.getItem('v3.searchQuery') || '',
  tabs: readTabs(),
  authToken: sessionStorage.getItem('v3.password') || '',
};

if (!state.tabs.length) {
  state.tabs = [
    {
      id: crypto.randomUUID(),
      title: 'Home',
      route: 'home',
      kind: 'route',
      content: ''
    }
  ];
}

let activeTabId = localStorage.getItem('v3.activeTabId') || state.tabs[0].id;
let runtimeConfig = null;
let proxyState = null;

const ROUTE_COPY = {
  home: {
    title: 'Home',
    eyebrow: 'Mission control',
    description: 'Interstellar-style home surface with your own lanes, custom cards, and fast launch flows.'
  },
  games: {
    title: 'Games',
    eyebrow: 'Arcade lane',
    description: 'Playable games, featured launches, and quick-open wrappers you can keep extending.'
  },
  apps: {
    title: 'Apps',
    eyebrow: 'Utility lane',
    description: 'Browser workspace, launchers, utilities, and custom app surfaces.'
  },
  features: {
    title: 'Features',
    eyebrow: 'Platform status',
    description: 'Customization, workspace behaviors, and platform capabilities.'
  },
  proxy: {
    title: 'Proxy',
    eyebrow: 'Browser workspace',
    description: 'Session-driven browser lane with proxy-ready plumbing and live targets.'
  },
  emulators: {
    title: 'Emulators',
    eyebrow: 'Systems lane',
    description: 'Emulator surfaces and imported runtimes, behind clean wrapper boundaries.'
  },
  settings: {
    title: 'Settings',
    eyebrow: 'Customization',
    description: 'Themes, layout behavior, and platform toggles that actually drive the UI.'
  }
};

async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (state.authToken) headers.set('x-v3-password', state.authToken);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) throw new Error('AUTH_REQUIRED');
  return response;
}

async function verifyPassword(password) {
  const response = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!response.ok) throw new Error('BAD_PASSWORD');
  state.authToken = password;
  sessionStorage.setItem('v3.password', password);
}

async function loadConfig() {
  const response = await apiFetch('/api/config');
  return response.json();
}

async function loadProxyState() {
  const response = await apiFetch('/api/proxy/status');
  return response.json();
}

async function loadLane(route) {
  const response = await apiFetch(`/api/lanes/${route}`);
  return response.json();
}

function readTabs() {
  try {
    return JSON.parse(localStorage.getItem('v3.tabs') || '[]');
  } catch {
    return [];
  }
}

function saveTabs() {
  localStorage.setItem('v3.tabs', JSON.stringify(state.tabs));
  localStorage.setItem('v3.activeTabId', activeTabId);
  localStorage.setItem('v3.activeRoute', state.activeRoute);
  localStorage.setItem('v3.searchQuery', state.searchQuery);
}

function applyTheme(themeId, themes) {
  const theme = themes.find((item) => item.id === themeId) || themes[0];
  if (!theme) return;
  Object.entries(theme.vars || {}).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
  localStorage.setItem('v3.theme', theme.id);
  state.activeTheme = theme.id;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function currentTab() {
  return state.tabs.find((tab) => tab.id === activeTabId) || state.tabs[0];
}

function closeTab(tabId) {
  if (state.tabs.length === 1) return;
  const index = state.tabs.findIndex((tab) => tab.id === tabId);
  if (index === -1) return;
  state.tabs.splice(index, 1);
  if (activeTabId === tabId) {
    activeTabId = state.tabs[Math.max(0, index - 1)]?.id || state.tabs[0].id;
  }
  saveTabs();
  renderTabs();
  bindRenderedEvents(runtimeConfig);
  bindWorkspaceIfPresent();
}

function renderTabs() {
  tabsEl.innerHTML = state.tabs.map((tab) => `
    <div class="tab-shell ${tab.id === activeTabId ? 'active' : ''}">
      <button class="tab ${tab.id === activeTabId ? 'active' : ''}" data-tab-id="${tab.id}">${escapeHtml(tab.title)}</button>
      ${state.tabs.length > 1 ? `<button class="tab-close" data-close-tab="${tab.id}" aria-label="Close ${escapeHtml(tab.title)}">×</button>` : ''}
    </div>
  `).join('');

  const activeTab = currentTab();
  tabContentEl.innerHTML = activeTab ? activeTab.content : '<p>No active tab</p>';

  tabsEl.querySelectorAll('[data-tab-id]').forEach((button) => {
    button.addEventListener('click', () => {
      activeTabId = button.dataset.tabId;
      saveTabs();
      renderTabs();
      bindRenderedEvents(runtimeConfig);
      bindWorkspaceIfPresent();
    });
  });

  tabsEl.querySelectorAll('[data-close-tab]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      closeTab(button.dataset.closeTab);
    });
  });
}

function matchesSearch(item) {
  if (!state.searchQuery) return true;
  const haystack = [item.title, item.description, item.notes, item.status, item.type].join(' ').toLowerCase();
  return haystack.includes(state.searchQuery.toLowerCase());
}

function cardMarkup(item) {
  const badges = [item.type, item.status].filter(Boolean).map((value) => `<span class="card-badge">${escapeHtml(value)}</span>`).join('');
  return `
    <article class="lane-card">
      <div class="card-head">
        <div>
          <p class="eyebrow">${escapeHtml(item.type || 'item')}</p>
          <h3>${escapeHtml(item.title || 'Untitled')}</h3>
        </div>
        <div class="card-badges">${badges}</div>
      </div>
      <p>${escapeHtml(item.description || item.notes || '')}</p>
      <div class="lane-actions">
        ${item.route ? `<button data-open-route="${escapeHtml(item.route)}" data-open-title="${escapeHtml(item.title || 'Route')}">Open</button>` : ''}
      </div>
    </article>
  `;
}

function featuredMarkup(section) {
  const items = (section.items || []).filter(matchesSearch);
  if (!items.length) return '';
  return `
    <section class="lane-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Featured</p>
          <h3>${escapeHtml(section.title)}</h3>
        </div>
        <span class="section-count">${items.length}</span>
      </div>
      <div class="lane-grid">${items.map(cardMarkup).join('')}</div>
    </section>
  `;
}

function heroMarkup(route) {
  const copy = ROUTE_COPY[route] || ROUTE_COPY.home;
  return `
    <section class="hero-card">
      <div>
        <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
        <h3>${escapeHtml(copy.title)}</h3>
        <p>${escapeHtml(copy.description)}</p>
      </div>
      <div class="hero-actions">
        <button data-quick-open="/apps/browser-workspace">Open workspace</button>
        <button class="ghost" data-route-jump="settings">Customize</button>
      </div>
    </section>
  `;
}

function summaryCards() {
  if (!runtimeConfig) return '';
  const cards = [
    { title: 'Games', value: runtimeConfig.games.length, detail: 'real catalog entries' },
    { title: 'Apps', value: runtimeConfig.apps.length + runtimeConfig.interstellar.apps.length, detail: 'launchable app surfaces' },
    { title: 'Themes', value: runtimeConfig.themes.length, detail: 'switchable looks' },
    { title: 'Proxy', value: proxyState?.ready ? 'Ready' : 'Scaffold', detail: proxyState?.message || 'adapter status' },
  ];
  return `<section class="summary-grid">${cards.map((card) => `
    <article class="summary-card">
      <p class="eyebrow">${escapeHtml(card.title)}</p>
      <h3>${escapeHtml(card.value)}</h3>
      <small>${escapeHtml(card.detail)}</small>
    </article>
  `).join('')}</section>`;
}

function emptyStateMarkup(route) {
  return `
    <section class="workspace-card empty-state">
      <p class="eyebrow">${escapeHtml(route)}</p>
      <h3>Nothing live here yet</h3>
      <p>This lane is wired and ready, but still needs real content or adapters.</p>
    </section>
  `;
}

function settingsMarkup(config) {
  return `
    <section class="settings-layout">
      <article class="lane-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Theme studio</p>
            <h3>Look and feel</h3>
          </div>
        </div>
        <div class="theme-list">
          ${(config.themes || []).map((theme) => `
            <button class="theme-pick ${theme.id === state.activeTheme ? 'active' : ''}" data-theme="${theme.id}">${theme.label}</button>
          `).join('')}
        </div>
      </article>

      <article class="lane-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Workspace</p>
            <h3>Platform toggles</h3>
          </div>
        </div>
        <div class="toggle-list">
          <div class="toggle-row"><span>Password gate</span><strong>${config.passwordProtection ? 'On' : 'Off'}</strong></div>
          <div class="toggle-row"><span>Proxy runtime</span><strong>${config.proxyEnabled ? 'On' : 'Scaffold'}</strong></div>
          <div class="toggle-row"><span>Saved tabs</span><strong>${state.tabs.length}</strong></div>
        </div>
      </article>

      <article class="lane-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Integration model</p>
            <h3>Customization layer</h3>
          </div>
        </div>
        <p>Your shell is now driven from local manifests, route components, and a separate runtime adapter layer.</p>
        <small>That keeps it Interstellar-inspired without turning it into a tangled fork.</small>
      </article>
    </section>
  `;
}

function routeMarkup(route, laneItems) {
  if (route === 'settings') return settingsMarkup(runtimeConfig);

  if (route === 'home') {
    return `
      ${heroMarkup(route)}
      ${summaryCards()}
      ${(laneItems || []).map(featuredMarkup).join('')}
    `;
  }

  const filtered = (laneItems || []).filter(matchesSearch);
  return `
    ${heroMarkup(route)}
    ${filtered.length
      ? `<section class="lane-section"><div class="lane-grid">${filtered.map(cardMarkup).join('')}</div></section>`
      : emptyStateMarkup(route)}
  `;
}

function upsertRouteTab(route, title, content) {
  const existing = state.tabs.find((tab) => tab.kind === 'route' && tab.route === route);
  if (existing) {
    existing.title = title;
    existing.content = content;
    activeTabId = existing.id;
    return;
  }

  state.tabs.push({
    id: crypto.randomUUID(),
    title,
    route,
    kind: 'route',
    content
  });
  activeTabId = state.tabs.at(-1).id;
}

function openUtilityTab({ title, route, content }) {
  state.tabs.push({
    id: crypto.randomUUID(),
    title,
    route,
    kind: 'utility',
    content
  });
  activeTabId = state.tabs.at(-1).id;
  saveTabs();
  renderTabs();
  bindRenderedEvents(runtimeConfig);
  bindWorkspaceIfPresent();
}

function bindWorkspaceIfPresent() {
  const activeTab = currentTab();
  if (activeTab?.route?.startsWith('/apps/browser-workspace') || activeTab?.route === 'proxy') {
    bindBrowserWorkspace(state.authToken);
  }
}

function renderLaneMeta(route, laneItems) {
  const count = Array.isArray(laneItems)
    ? laneItems.flatMap((item) => item?.items || item).filter(Boolean).length
    : 0;
  laneMetaEl.textContent = `${count} items • ${state.searchQuery ? `filtered by “${state.searchQuery}”` : 'ready to launch'}`;
  laneActionsEl.innerHTML = `
    <button data-quick-open="/apps/browser-workspace">Workspace</button>
    <button class="ghost" data-route-jump="settings">Customize</button>
  `;
}

function bindRenderedEvents(config) {
  if (!config) return;

  document.querySelectorAll('[data-theme]').forEach((button) => {
    button.addEventListener('click', async () => {
      applyTheme(button.dataset.theme, config.themes || []);
      await setRoute('settings');
    });
  });

  document.querySelectorAll('[data-open-route]').forEach((button) => {
    button.addEventListener('click', () => {
      const route = button.dataset.openRoute;
      const title = button.dataset.openTitle || route.split('/').pop();
      const content = route.startsWith('/apps/browser-workspace')
        ? browserWorkspaceMarkup()
        : `
          <section class="workspace-card route-placeholder">
            <p class="eyebrow">${escapeHtml(title)}</p>
            <h3>${escapeHtml(title)}</h3>
            <p>This route is mounted and ready for a custom wrapper.</p>
            <small><code>${escapeHtml(route)}</code></small>
          </section>
        `;
      openUtilityTab({ title, route, content });
    });
  });

  document.querySelectorAll('[data-route-jump]').forEach((button) => {
    button.addEventListener('click', async () => {
      await setRoute(button.dataset.routeJump);
    });
  });

  document.querySelectorAll('[data-quick-open]').forEach((button) => {
    button.addEventListener('click', () => {
      openUtilityTab({
        title: 'Browser Workspace',
        route: button.dataset.quickOpen,
        content: browserWorkspaceMarkup()
      });
    });
  });
}

async function setRoute(route) {
  state.activeRoute = route;
  const copy = ROUTE_COPY[route] || { title: route };
  routeTitle.textContent = copy.title;
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.route === route));

  const laneKey = route === 'home' ? 'featured' : route === 'settings' ? 'integrations' : route;
  const lane = await loadLane(laneKey);
  const content = routeMarkup(route, lane.items || lane);

  upsertRouteTab(route, copy.title, content);
  renderLaneMeta(route, lane.items || lane);
  saveTabs();
  renderTabs();
  bindRenderedEvents(runtimeConfig);
  bindWorkspaceIfPresent();
}

newTabBtn.addEventListener('click', () => {
  openUtilityTab({
    title: `Tab ${state.tabs.length + 1}`,
    route: state.activeRoute,
    content: `
      <section class="workspace-card route-placeholder">
        <p class="eyebrow">Workspace</p>
        <h3>Fresh tab</h3>
        <p>This tab is ready for whatever route, game, app, or proxy surface you open next.</p>
      </section>
    `
  });
});

searchInput?.addEventListener('input', async (event) => {
  state.searchQuery = event.target.value.trim();
  await setRoute(state.activeRoute);
});

passwordSubmitEl?.addEventListener('click', async () => {
  passwordErrorEl.textContent = '';
  try {
    await verifyPassword(passwordInputEl.value);
    passwordGateEl.classList.add('hidden');
    await bootstrap();
  } catch {
    passwordErrorEl.textContent = 'Incorrect password.';
  }
});

async function bootstrap() {
  try {
    const [config, proxy] = await Promise.all([loadConfig(), loadProxyState()]);
    runtimeConfig = config;
    proxyState = proxy;
    applyTheme(state.activeTheme, config.themes || []);
    passwordHintEl.textContent = config.passwordProtection ? (config.passwordHint || 'Enter the workspace password to continue.') : 'No password required.';
    searchInput.value = state.searchQuery;

    navButtons.forEach((button) => {
      button.onclick = async () => {
        try {
          await setRoute(button.dataset.route);
        } catch (error) {
          console.error('route-change-failed', error);
        }
      };
    });

    passwordGateEl.classList.add('hidden');
    await setRoute(state.activeRoute);
  } catch (error) {
    if (String(error.message) === 'AUTH_REQUIRED') {
      passwordGateEl.classList.remove('hidden');
      return;
    }
    console.error(error);
  }
}

window.addEventListener('error', (event) => {
  console.error('v3-ui-error', event.error || event.message || event);
});

bootstrap();
