const routeTitle = document.getElementById('routeTitle');
const tabsEl = document.getElementById('tabs');
const tabContentEl = document.getElementById('tabContent');
const newTabBtn = document.getElementById('newTabBtn');
const navButtons = [...document.querySelectorAll('[data-route]')];

let activeRoute = 'home';
let tabs = [
  { id: crypto.randomUUID(), title: 'Home', route: 'home', content: 'Welcome to Skeezers Arcade V3. This workspace will power games, apps, proxy, and emulators from one Koyeb-ready stack.' }
];
let activeTabId = tabs[0].id;

function renderTabs() {
  tabsEl.innerHTML = tabs.map((tab) => `<button class="tab ${tab.id === activeTabId ? 'active' : ''}" data-tab-id="${tab.id}">${tab.title}</button>`).join('');
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  tabContentEl.innerHTML = activeTab ? `<h3>${activeTab.title}</h3><p>${activeTab.content}</p>` : '<p>No active tab</p>';
  tabsEl.querySelectorAll('[data-tab-id]').forEach((button) => {
    button.addEventListener('click', () => {
      activeTabId = button.dataset.tabId;
      renderTabs();
    });
  });
}

function setRoute(route) {
  activeRoute = route;
  routeTitle.textContent = route[0].toUpperCase() + route.slice(1);
  navButtons.forEach((button) => button.classList.toggle('active', button.dataset.route === route));
  tabs.push({
    id: crypto.randomUUID(),
    title: routeTitle.textContent,
    route,
    content: `This is the ${route} lane. V3 will connect real ${route === 'proxy' ? 'backend-powered proxy' : route} experiences here.`
  });
  activeTabId = tabs.at(-1).id;
  renderTabs();
}

navButtons.forEach((button) => button.addEventListener('click', () => setRoute(button.dataset.route)));
newTabBtn.addEventListener('click', () => {
  tabs.push({
    id: crypto.randomUUID(),
    title: `Tab ${tabs.length + 1}`,
    route: activeRoute,
    content: `Fresh workspace tab for the ${activeRoute} lane.`
  });
  activeTabId = tabs.at(-1).id;
  renderTabs();
});

renderTabs();
