import { loadConfig } from './config.js';

export function getCatalog() {
  return loadConfig();
}

export function getLane(route) {
  const config = loadConfig();
  if (route === 'games') return config.games;
  if (route === 'apps') return config.apps;
  if (route === 'proxy') return config.proxy;
  if (route === 'emulators') return config.integrations.filter((item) => item.type === 'emulator');
  if (route === 'integrations') return config.integrations;
  return [];
}
