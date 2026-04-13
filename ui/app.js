import { browserWorkspaceMarkup, bindBrowserWorkspace } from './workspace.js';

const routeTitle = document.getElementById('routeTitle');
const tabsEl = document.getElementById('tabs');
const tabContentEl = document.getElementById('tabContent');
const newTabBtn = document.getElementById('newTabBtn');
const navButtons = [...document.querySelectorAll('[data-route]')];
const passwordGateEl = document.getElementById('passwordGate');
const passwordInputEl = document.getElementById('passwordInput');
const passwordSubmitEl = document.getElementById('passwordSubmit');
const passwordErrorEl = document.getElementById('passwordError');
const passwordHintEl = document.getElementById('passwordHint');

const state = {
  activeRoute: localStorage.getItem('v3.activeRoute') || 'home',
  activeTheme: localStorage.getItem('v3.theme') || 'default',
  tabs: readTabs(),
  authToken: sessionStorage.getItem('v3.password') || '',
};

if (!state.tabs.length) {
  state.tabs = [
    {
      id: crypto.randomUUID(),
      title: 'Home',
      route: 'home',
      content: 'Welcome to Skeezers Arcade V3. This workspace will power games, apps, proxy, and emulators from one Render-ready stack.'
    }
  ];
}

let activeTabId = localStorage.getItem('v3.activeTabId') || state.tabs[0].id;
let runtimeConfig = null;
let proxyState = null;

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
}

function applyTheme(themeId, themes) {
  const theme = themes.find((item) => item.id === themeId) || themes[0];
  if (!theme) return;
  Object.entries(theme.vars || {}).forEach(([key, value]) => document.documentElement.style.setProperty(key, value));
  localStorage.setItem('v3.theme', theme.id);
  state.activeTheme = theme.id;
}

function renderTabs() {
  tabsEl.innerHTML = state.tabs.map((tab) => `<button class="tab ${tab.id === activeTabId ? 'active' : ''}" data-tab-id="${tab.id}">${tab.title}</button>`).join('');
  const activeTab = state.tabs.find((tab) => tab.id === activeTabId);
  tabContentEl.innerHTML = activeTab ? `<div class="workspace-card"><h3>${activeTab.title}</h3><div>${activeTab.content}</div></div>` : '<p>No active tab</p>';
  tabsEl.querySelectorAll('[data-tab-id]').forEach((button) => {
    button.addEventListener('click', () => {
      activeTabId = button.dataset.tabId;
      saveTabs();
      renderTabs();
      bindRenderedEvents(runtimeConfig);
    });
  });
}

function cardMarkup(item) {
  return `
    <article class="lane-card">
      <h3>${item.title}</h3>
      <p>${item.description || item.notes || ''}</p>
      <small>Status: ${item.status || 'unknown'}</small>
      ${item.route ? `<div class="lane-actions"><button data-open-route="${item.route}">Open route</button></div>` : ''}
    </article>
  `;
}

function featuredMarkup(section) {
  return `
    <section>
      <p class="eyebrow">${section.title}</p>
      <div class="lane-grid">${(section.items || []).map(cardMarkup).join('')}</div>
    </section>
  `;
}

function settingsMarkup(config) {
  return `
    <div class="settings-grid">
      <article class="lane-card">
        <h3>Themes</h3>
        <div class="theme-list">
          ${(config.themes || []).map((theme) => `<button class="theme-pick ${theme.id === state.activeTheme ? 'active' : ''}" data-theme="${theme.id}">${theme.label}</button>`).join('')}
        </div>
      </article>
      <article class="lane-card">
        <h3>Password Gate</h3>
        <p>${config.passwordProtection ? 'Enabled at backend level' : 'Currently disabled'}</p>
        <small>${config.passwordHint || 'No password hint set.'}</small>
      </article>
      <article class="lane-card">
        <h3>Proxy Status</h3>
        <p>${proxyState?.message || 'Unknown'}</p>
        <small>${proxyState?.adapter?.message || ''}</small>
      </article>
    </div>
  `;
}

function bindRenderedEvents(config) {
  document.querySelectorAll('[data-theme]').forEach((button) => {
    button.addEventListener('click', () => {
      applyTheme(button.dataset.theme, config.themes || []);
      setRoute('settings');
    });
  });
  document.querySelectorAll('[data-open-route]').forEach((button) => {
    button.addEventListener('click', () => {
      const route = button.dataset.openRoute;
      const title = route.split('/').pop();
      const workspaceContent = route.startsWith('/apps/browser-workspace')
        ? browserWorkspaceMarkup()
        : `<p>Route target scaffold: <code>${route}</code></p>`;
      state.tabs.push({
        id: crypto.randomUUID(),
        title,
        route: state.activeRoute,
        content: workspaceContent
      });
      activeTabId = state.tabs.at(-1).id;
      saveTabs();
      renderTabs();
      bindRenderedEvents(config);
      bindBrowserWorkspace();
    });
  });
}

async function setRoute(route) {
  state.activeRoute = route;
  routeTitle.textContent = route[0].toUpperCase() + route.slice(1);
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.route === route));

  const lane = await loadLane(route === 'home' || route === 'settings' ? (route === 'home' ? 'featured' : 'integrations') : route);
  const markup = route === 'settings'
    ? settingsMarkup(runtimeConfig)
    : route === 'home'
      ? `
        <div class="workspace-card">
          <h3>Platform overview</h3>
          <p>V3 is now catalog-driven, Render-ready, and structured for real proxy/app/game integrations.</p>
        </div>
        ${(lane.items || []).map(featuredMarkup).join('')}
      `
      : `
        <section>
          <p class="eyebrow">${routeTitle.textContent}</p>
          <div class="lane-grid">${(lane.items || []).map(cardMarkup).join('')}</div>
        </section>
      `;

  state.tabs.push({
    id: crypto.randomUUID(),
    title: routeTitle.textContent,
    route,
    content: markup
  });
  activeTabId = state.tabs.at(-1).id;
  saveTabs();
  renderTabs();
  bindRenderedEvents(runtimeConfig);
}

newTabBtn.addEventListener('click', () => {
  state.tabs.push({
    id: crypto.randomUUID(),
    title: `Tab ${state.tabs.length + 1}`,
    route: state.activeRoute,
    content: `Fresh workspace tab for the ${state.activeRoute} lane.`
  });
  activeTabId = state.tabs.at(-1).id;
  saveTabs();
  renderTabs();
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
    passwordHintEl.textContent = config.passwordHint || 'Enter the workspace password to continue.';
    navButtons.forEach((button) => button.onclick = () => setRoute(button.dataset.route));
    routeTitle.textContent = state.activeRoute[0].toUpperCase() + state.activeRoute.slice(1);
    navButtons.forEach((button) => button.classList.toggle('active', button.dataset.route === state.activeRoute));
    passwordGateEl.classList.add('hidden');
    renderTabs();
  } catch (error) {
    if (String(error.message) === 'AUTH_REQUIRED') {
      passwordGateEl.classList.remove('hidden');
      return;
    }
    console.error(error);
  }
}

bootstrap();
