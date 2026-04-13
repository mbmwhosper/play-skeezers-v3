const routeTitle = document.getElementById('routeTitle');
const tabsEl = document.getElementById('tabs');
const tabContentEl = document.getElementById('tabContent');
const newTabBtn = document.getElementById('newTabBtn');
const navButtons = [...document.querySelectorAll('[data-route]')];

const state = {
  activeRoute: localStorage.getItem('v3.activeRoute') || 'home',
  activeTheme: localStorage.getItem('v3.theme') || 'default',
  tabs: readTabs(),
};

if (!state.tabs.length) {
  state.tabs = [
    {
      id: crypto.randomUUID(),
      title: 'Home',
      route: 'home',
      content: 'Welcome to Skeezers Arcade V3. This workspace will power games, apps, proxy, and emulators from one Koyeb-ready stack.'
    }
  ];
}

let activeTabId = localStorage.getItem('v3.activeTabId') || state.tabs[0].id;

async function loadConfig() {
  const response = await fetch('/api/config');
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
  tabContentEl.innerHTML = activeTab ? `<h3>${activeTab.title}</h3><p>${activeTab.content}</p>` : '<p>No active tab</p>';
  tabsEl.querySelectorAll('[data-tab-id]').forEach((button) => {
    button.addEventListener('click', () => {
      activeTabId = button.dataset.tabId;
      saveTabs();
      renderTabs();
    });
  });
}

function setRoute(route, config) {
  state.activeRoute = route;
  routeTitle.textContent = route[0].toUpperCase() + route.slice(1);
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.route === route));

  const laneMap = {
    games: config.games,
    apps: config.apps,
    proxy: config.proxy,
    emulators: [{ title: 'Emulators', description: 'Emulator lane is queued after core proxy/app work.' }],
    settings: [{ title: 'Settings', description: 'Use themes, password gate, and future platform preferences here.' }],
    home: [{ title: 'Home', description: 'Launcher overview and platform status.' }],
  };

  const laneItems = laneMap[route] || [];
  state.tabs.push({
    id: crypto.randomUUID(),
    title: routeTitle.textContent,
    route,
    content: laneItems.map((item) => `<strong>${item.title}</strong><br>${item.description}<br><small>${item.status || ''}</small>`).join('<hr>')
  });
  activeTabId = state.tabs.at(-1).id;
  saveTabs();
  renderTabs();
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

loadConfig().then((config) => {
  applyTheme(state.activeTheme, config.themes || []);
  navButtons.forEach((button) => button.addEventListener('click', () => setRoute(button.dataset.route, config)));
  routeTitle.textContent = state.activeRoute[0].toUpperCase() + state.activeRoute.slice(1);
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.route === state.activeRoute));
  renderTabs();
});
